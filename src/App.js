import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Models from './components/Models';
import Matches from './components/Matches';
import Predictions from './components/Predictions';
import MatchDetail from './components/MatchDetail';
import GoogleAuth from './components/GoogleAuth';
import './App.css';

// Importando o serviço do Google Sheets
import { fetchAllData, checkServiceHealth } from './services/sheetsService';
import { signIn } from './services/googleAuthService';

// Importando os dados estáticos como fallback caso a API falhe
import modelsData from './data/models';
import matchesData from './data/matches';
import predictionsData from './data/predictions';

// Mapeamento dos nomes das abas da planilha para os nomes usados pela aplicação
const SHEET_MAPPING = {
  'apostas': 'predictions',
  'jogos': 'matches',
  'times': 'models',
  'usuarios': 'users'
};

function App() {
  const [models, setModels] = useState([]);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [needsScopes, setNeedsScopes] = useState(false);

  // Função para verificar se o serviço requer autenticação
  useEffect(() => {
    async function checkServiceStatus() {
      try {
        const status = await checkServiceHealth();
        setNeedsAuth(status.requiresAuth === true);
        setNeedsScopes(status.requiresScopes === true);
        
        if (!status.accessible && !status.requiresAuth && !status.requiresScopes) {
          setError('Serviço de planilhas não está acessível. Verifique a configuração.');
          
          // Usar dados de fallback
          setModels(modelsData);
          setMatches(matchesData);
          setPredictions(predictionsData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao verificar serviço:', error);
        setNeedsAuth(true);
      }
    }
    
    checkServiceStatus();
  }, []);

  // Função para encontrar uma chave em um objeto de forma insensível a maiúsculas/minúsculas
  const findKeyInsensitive = (obj, targetKey) => {
    if (!obj || typeof obj !== 'object') return null;
    
    // Primeiro tenta encontrar a chave exata
    if (targetKey in obj) return targetKey;
    
    // Depois tenta encontrar de forma insensível a maiúsculas/minúsculas
    const lowerTargetKey = targetKey.toLowerCase();
    const keys = Object.keys(obj);
    
    for (const key of keys) {
      if (key.toLowerCase() === lowerTargetKey) {
        return key;
      }
    }
    
    return null;
  };

  // Função para processar os dados recebidos da planilha e mapeá-los corretamente
  const processSheetData = (data) => {
    console.log('Dados brutos recebidos da planilha:', data);
    
    // Objeto para armazenar os dados processados
    const processed = {
      models: [],
      matches: [],
      predictions: []
    };
    
    // Verificar quais chaves estão disponíveis nos dados
    console.log('Chaves disponíveis nos dados:', Object.keys(data));
    
    // Para cada chave no mapeamento, busca os dados correspondentes
    Object.entries(SHEET_MAPPING).forEach(([sheetName, appName]) => {
      // Busca a chave real no objeto de dados (insensível a maiúsculas/minúsculas)
      const actualKey = findKeyInsensitive(data, sheetName);
      
      if (actualKey) {
        const sheetData = data[actualKey] || [];
        processed[appName] = sheetData;
        console.log(`Dados processados para ${sheetName} (${actualKey}) -> ${appName}:`, sheetData.length);
      } else {
        console.log(`Nenhum dado encontrado para ${sheetName}`);
      }
    });
    
    // Se alguma aba estiver faltando, tenta usar as primeiras abas disponíveis
    if (processed.models.length === 0 && processed.matches.length === 0 && processed.predictions.length === 0) {
      console.log('Nenhum dado processado usando o mapeamento padrão, tentando usar abas disponíveis...');
      
      const keys = Object.keys(data);
      if (keys.length >= 3) {
        if (processed.models.length === 0 && keys[0] && data[keys[0]]) {
          processed.models = data[keys[0]];
          console.log(`Usando aba ${keys[0]} como models:`, processed.models.length);
        }
        
        if (processed.matches.length === 0 && keys[1] && data[keys[1]]) {
          processed.matches = data[keys[1]];
          console.log(`Usando aba ${keys[1]} como matches:`, processed.matches.length);
        }
        
        if (processed.predictions.length === 0 && keys[2] && data[keys[2]]) {
          processed.predictions = data[keys[2]];
          console.log(`Usando aba ${keys[2]} como predictions:`, processed.predictions.length);
        }
      }
    }
    
    return processed;
  };

  // Efeito para carregar dados quando autenticado ou quando não precisar de autenticação
  useEffect(() => {
    async function loadData() {
      // Se precisar de autenticação e não estiver autenticado, não tenta carregar
      if ((needsAuth || needsScopes) && !isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        setDebugInfo(null);
        
        console.log("Tentando carregar dados da planilha Google Sheets...");
        
        // Busca os dados do Google Sheets
        const rawData = await fetchAllData();
        
        // Processa os dados para mapear corretamente as abas para os nomes usados pelo app
        const processedData = processSheetData(rawData);
        
        // Atualiza o estado com os dados obtidos
        setModels(processedData.models || []);
        setMatches(processedData.matches || []);
        setPredictions(processedData.predictions || []);
        
        // Limpa flags de necessidade de autenticação/escopos
        setNeedsScopes(false);
        
        setLoading(false);
        console.log("Dados carregados com sucesso:", {
          models: (processedData.models || []).length,
          matches: (processedData.matches || []).length,
          predictions: (processedData.predictions || []).length
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        
        // Verifica se o erro está relacionado a permissões insuficientes
        if (error.message && error.message.includes('Permissões insuficientes')) {
          setNeedsScopes(true);
        }
        
        // Informações para debug
        const debugInfo = {
          message: error.message,
          type: error.name,
          stack: error.stack,
          timestamp: new Date().toISOString()
        };
        
        setDebugInfo(debugInfo);
        setError('Não foi possível carregar os dados da planilha Google Sheets. Verificar o console para mais detalhes.');
        
        // Usa os dados estáticos como fallback em caso de erro
        setModels(modelsData);
        setMatches(matchesData);
        setPredictions(predictionsData);
        
        setLoading(false);
      }
    }

    // Chama a função para carregar os dados
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, needsAuth, needsScopes]);

  // Função para lidar com a mudança no estado de autenticação
  const handleAuthChange = (authStatus) => {
    setIsAuthenticated(authStatus);
  };

  // Função para solicitar reautenticação com escopos corretos
  const handleRequestScopes = async () => {
    try {
      setLoading(true);
      await signIn(); // Isso deve abrir o diálogo de autenticação novamente
      setNeedsScopes(false);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      setError(`Erro ao solicitar permissões: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="logo">
            <h1>BetterBet</h1>
          </div>
          <nav className="nav">
            <Link to="/">Dashboard</Link>
            <Link to="/models">Modelos</Link>
            <Link to="/matches">Partidas</Link>
            <Link to="/predictions">Previsões</Link>
          </nav>
          <div className="auth-container">
            <GoogleAuth onAuthChange={handleAuthChange} />
          </div>
        </header>

        {needsAuth && !isAuthenticated && (
          <div className="auth-required-banner">
            <p>Esta aplicação requer autenticação para acessar os dados da planilha.</p>
            <p>Por favor, faça login com sua conta Google.</p>
          </div>
        )}

        {needsScopes && isAuthenticated && (
          <div className="auth-required-banner scopes-required">
            <p>Permissões insuficientes para acessar a planilha do Google.</p>
            <p>É necessário conceder acesso de leitura ao Google Sheets.</p>
            <button 
              className="auth-button login-button" 
              onClick={handleRequestScopes}
            >
              Conceder Permissões
            </button>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button 
              className="error-details-button" 
              onClick={() => console.log('Debug info:', debugInfo)}
            >
              Ver detalhes no console
            </button>
          </div>
        )}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard models={models} matches={matches} predictions={predictions} />} />
            <Route path="/models" element={<Models models={models} />} />
            <Route path="/matches" element={<Matches matches={matches} />} />
            <Route path="/predictions" element={<Predictions predictions={predictions} />} />
            <Route path="/match/:id" element={<MatchDetail matches={matches} predictions={predictions} />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2025 BetterBet - Análise estatística de apostas esportivas</p>
        </footer>
      </div>
    </Router>
  );
}

export default App; 