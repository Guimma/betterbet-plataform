import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { useColorScheme } from '@mui/joy/styles';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CircularProgress from '@mui/joy/CircularProgress';
import Alert from '@mui/joy/Alert';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';

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
  'usuarios': 'users',
  // Adicionando mapeamentos alternativos para garantir que encontremos as abas corretas
  'previsões': 'predictions',
  'partidas': 'matches',
  'modelos': 'models',
  'Apostas': 'predictions',
  'Jogos': 'matches',
  'Times': 'models',
  'Previsões': 'predictions',
  'Partidas': 'matches',
  'Modelos': 'models'
};

// Componente de alternar entre temas claro/escuro
function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <IconButton
      variant="outlined"
      color="neutral"
      onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
      size="sm"
    >
      {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
    </IconButton>
  );
}

// Componente de navegação
function Navigation() {
  return (
    <Box 
      component="nav" 
      sx={{ 
        display: 'flex', 
        gap: 2,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}
    >
      <Button 
        component={RouterLink} 
        to="/"
        variant="plain"
        color="neutral"
      >
        Dashboard
      </Button>
      <Button 
        component={RouterLink} 
        to="/models"
        variant="plain"
        color="neutral"
      >
        Modelos
      </Button>
      <Button 
        component={RouterLink} 
        to="/matches"
        variant="plain"
        color="neutral"
      >
        Partidas
      </Button>
      <Button 
        component={RouterLink} 
        to="/predictions"
        variant="plain"
        color="neutral"
      >
        Previsões
      </Button>
    </Box>
  );
}

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
    
    // Primeiro, vamos analisar todas as abas disponíveis e suas características
    const tabInfo = {};
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        const sample = data[key][0] || {};
        const fields = Object.keys(sample);
        
        tabInfo[key] = {
          count: data[key].length,
          fields: fields,
          sample: sample,
          possibleType: 'unknown'
        };
        
        // Tentar identificar o tipo de dados com base nos campos
        if (fields.some(f => ['model', 'version', 'accuracy', 'nome_modelo', 'modelo'].includes(f.toLowerCase()))) {
          tabInfo[key].possibleType = 'models';
        } 
        else if (fields.some(f => ['home_team', 'away_team', 'match_date', 'casa', 'fora', 'data_partida'].includes(f.toLowerCase()))) {
          tabInfo[key].possibleType = 'matches';
        }
        else if (fields.some(f => ['prediction', 'probability', 'odd', 'aposta', 'probabilidade', 'odds'].includes(f.toLowerCase()))) {
          tabInfo[key].possibleType = 'predictions';
        }
        
        console.log(`Aba ${key}: ${data[key].length} registros, possível tipo: ${tabInfo[key].possibleType}, campos: ${fields.join(', ')}`);
      }
    });
    
    // Para cada chave no mapeamento, busca os dados correspondentes
    Object.entries(SHEET_MAPPING).forEach(([sheetName, appName]) => {
      // Busca a chave real no objeto de dados (insensível a maiúsculas/minúsculas)
      const actualKey = findKeyInsensitive(data, sheetName);
      
      if (actualKey) {
        const sheetData = data[actualKey] || [];
        
        // Verifica se já temos dados para este tipo e se os novos dados são mais numerosos
        if (processed[appName].length < sheetData.length) {
          processed[appName] = sheetData;
          console.log(`Dados processados para ${sheetName} (${actualKey}) -> ${appName}:`, sheetData.length);
        } else {
          console.log(`Ignorando dados de ${sheetName} (${actualKey}) pois já temos mais dados para ${appName}`);
        }
      } else {
        console.log(`Nenhum dado encontrado para ${sheetName}`);
      }
    });
    
    // Verificação adicional para garantir que temos os dados corretos
    console.log('Dados processados após mapeamento de nomes:', {
      models: processed.models.length,
      matches: processed.matches.length,
      predictions: processed.predictions.length
    });
    
    // Verificação de integridade dos dados - se algum tipo estiver vazio, tenta identificar pelo conteúdo
    if (processed.models.length === 0 || processed.matches.length === 0 || processed.predictions.length === 0) {
      console.warn('ALERTA: Alguns dados estão vazios após o processamento!');
      
      // Usar as informações de tabInfo para preencher os dados faltantes
      Object.entries(tabInfo).forEach(([key, info]) => {
        const tabData = data[key] || [];
        
        // Se o tipo foi identificado e ainda não temos dados para esse tipo
        if (info.possibleType !== 'unknown' && processed[info.possibleType].length === 0) {
          processed[info.possibleType] = tabData;
          console.log(`Usando aba ${key} como ${info.possibleType} com base na análise de conteúdo: ${tabData.length} registros`);
        }
      });
      
      // Se ainda faltam dados, tenta usar as maiores abas disponíveis para cada tipo
      const typesMissing = Object.keys(processed).filter(type => processed[type].length === 0);
      if (typesMissing.length > 0) {
        console.log(`Ainda faltam dados para: ${typesMissing.join(', ')}. Tentando usar as maiores abas disponíveis.`);
        
        // Ordenar as abas por tamanho (da maior para a menor)
        const sortedTabs = Object.keys(tabInfo)
          .filter(key => !Object.values(processed).includes(data[key])) // Filtrar abas já usadas
          .sort((a, b) => tabInfo[b].count - tabInfo[a].count);
        
        // Atribuir as maiores abas aos tipos faltantes
        typesMissing.forEach((type, index) => {
          if (index < sortedTabs.length) {
            const tabKey = sortedTabs[index];
            processed[type] = data[tabKey] || [];
            console.log(`Atribuindo aba ${tabKey} (${tabInfo[tabKey].count} registros) ao tipo ${type} como último recurso`);
          }
        });
      }
    }
    
    // Verificação final dos dados processados
    console.log('Dados processados final:', {
      models: processed.models.length,
      matches: processed.matches.length,
      predictions: processed.predictions.length
    });
    
    return processed;
  };

  // Função para processar os dados e garantir que os valores numéricos sejam tratados corretamente
  const processNumericValues = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    console.log('Dados originais antes do processamento:', JSON.stringify(data.slice(0, 2)));
    
    // Verificar se todos os comprimentos são 999
    if (data.length === 999) {
      console.error('ALERTA: O comprimento do array é exatamente 999, o que pode indicar uma limitação!');
    }
    
    const processed = data.map(item => {
      const processedItem = { ...item };
      
      // Processa cada propriedade do item
      Object.keys(processedItem).forEach(key => {
        const value = processedItem[key];
        
        // Verifica se o valor é '999' ou 999, que pode indicar um valor limitado
        if (value === '999' || value === 999) {
          console.warn(`Valor possivelmente limitado encontrado para ${key}:`, value, 'em:', JSON.stringify(item));
        }
        
        // Se for uma string que parece um número
        if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
          // Verifica se é um número com casas decimais
          if (value.includes('.')) {
            processedItem[key] = parseFloat(value);
          } else {
            processedItem[key] = parseInt(value, 10);
          }
        }
      });
      
      return processedItem;
    });
    
    console.log('Dados após processamento:', JSON.stringify(processed.slice(0, 2)));
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
        console.log("Dados brutos recebidos:", Object.keys(rawData));
        
        // Verificar se há alguma limitação nos dados brutos
        Object.entries(rawData).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length === 999) {
            console.error(`ALERTA: O array ${key} tem exatamente 999 elementos, o que pode indicar uma limitação!`);
          }
        });
        
        // Processa os dados para mapear corretamente as abas para os nomes usados pelo app
        const processedData = processSheetData(rawData);
        console.log("Dados após processSheetData:", {
          models: processedData.models ? processedData.models.length : 0,
          matches: processedData.matches ? processedData.matches.length : 0,
          predictions: processedData.predictions ? processedData.predictions.length : 0
        });
        
        // Verificar se há alguma limitação nos dados processados
        Object.entries(processedData).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length === 999) {
            console.error(`ALERTA: O array processado ${key} tem exatamente 999 elementos, o que pode indicar uma limitação!`);
          }
        });
        
        // Processa os valores numéricos antes de atualizar o estado
        const processedModels = processNumericValues(processedData.models || []);
        const processedMatches = processNumericValues(processedData.matches || []);
        const processedPredictions = processNumericValues(processedData.predictions || []);
        
        // Atualiza o estado com os dados processados
        setModels(processedModels);
        setMatches(processedMatches);
        setPredictions(processedPredictions);
        
        // Limpa flags de necessidade de autenticação/escopos
        setNeedsScopes(false);
        
        setLoading(false);
        console.log("Dados carregados com sucesso:", {
          models: processedModels.length,
          matches: processedMatches.length,
          predictions: processedPredictions.length
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
        
        // Usa os dados estáticos como fallback em caso de erro, também processando os valores numéricos
        setModels(processNumericValues(modelsData));
        setMatches(processNumericValues(matchesData));
        setPredictions(processNumericValues(predictionsData));
        
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
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          p: 2
        }}
      >
        <CircularProgress size="lg" />
        <Typography level="title-lg" sx={{ mt: 2 }}>
          Carregando dados...
        </Typography>
      </Box>
    );
  }

  return (
    <Router>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.body'
      }}>
        <Sheet 
          component="header" 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            boxShadow: 'sm'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: { xs: '100%', md: 'auto' }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              className: 'logo-container'
            }}>
              <img 
                src={`${process.env.PUBLIC_URL}/logo_icon.svg`}
                alt="BetterBet Icon" 
                style={{ height: '40px', width: 'auto' }}
                className="logo-icon"
              />
              <img 
                src={`${process.env.PUBLIC_URL}/logo_name.svg`}
                alt="BetterBet" 
                style={{ height: '25px', width: 'auto', marginLeft: '8px' }}
                className="logo-name"
                sx={{ display: { xs: 'none', sm: 'block' } }} // Hide on very small screens
              />
            </Box>
          </Box>
          
          <Navigation />
          
          <Box sx={{ 
            ml: { xs: 0, md: 'auto' },
            mt: { xs: 2, md: 0 },
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <ModeToggle />
            <GoogleAuth onAuthChange={handleAuthChange} />
          </Box>
        </Sheet>

        {needsAuth && !isAuthenticated && (
          <Alert 
            variant="soft" 
            color="warning" 
            sx={{ mx: 'auto', my: 2, maxWidth: 'sm', width: '100%' }}
            startDecorator={<InfoOutlined />}
          >
            <Box>
              <Typography level="title-sm">Autenticação necessária</Typography>
              <Typography level="body-sm">
                Esta aplicação requer autenticação para acessar os dados da planilha.
                Por favor, faça login com sua conta Google.
              </Typography>
            </Box>
          </Alert>
        )}

        {needsScopes && isAuthenticated && (
          <Alert 
            variant="soft" 
            color="danger" 
            sx={{ mx: 'auto', my: 2, maxWidth: 'sm', width: '100%' }}
            startDecorator={<InfoOutlined />}
            endDecorator={
              <Button 
                onClick={handleRequestScopes}
                size="sm"
                variant="solid"
                color="danger"
              >
                Conceder Permissões
              </Button>
            }
          >
            <Box>
              <Typography level="title-sm">Permissões insuficientes</Typography>
              <Typography level="body-sm">
                É necessário conceder acesso de leitura ao Google Sheets para visualizar os dados.
              </Typography>
            </Box>
          </Alert>
        )}

        {error && (
          <Alert 
            variant="soft" 
            color="danger" 
            sx={{ mx: 'auto', my: 2, maxWidth: 'sm', width: '100%' }}
            startDecorator={<InfoOutlined />}
            endDecorator={
              <Button 
                onClick={() => console.log('Debug info:', debugInfo)}
                size="sm"
                variant="solid"
                color="danger"
              >
                Ver detalhes
              </Button>
            }
          >
            <Typography>{error}</Typography>
          </Alert>
        )}

        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            p: 3,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Card variant="outlined" sx={{ flex: 1, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard models={models} matches={matches} predictions={predictions} />} />
              <Route path="/models" element={<Models models={models} />} />
              <Route path="/matches" element={<Matches matches={matches} />} />
              <Route path="/predictions" element={<Predictions predictions={predictions} />} />
              <Route path="/match/:id" element={<MatchDetail matches={matches} predictions={predictions} />} />
            </Routes>
          </Card>
        </Box>

        <Sheet 
          component="footer" 
          sx={{ 
            p: 2, 
            mt: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography level="body-sm" textAlign="center">
            &copy; 2025 BetterBet - Análise estatística de apostas esportivas
          </Typography>
        </Sheet>
      </Box>
    </Router>
  );
}

export default App; 