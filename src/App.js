import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Models from './components/Models';
import Matches from './components/Matches';
import Predictions from './components/Predictions';
import MatchDetail from './components/MatchDetail';
import './App.css';

// Importando o serviço do Google Sheets
import { fetchAllData } from './services/sheetsService';

// Importando os dados estáticos como fallback caso a API falhe
import modelsData from './data/models';
import matchesData from './data/matches';
import predictionsData from './data/predictions';

function App() {
  const [models, setModels] = useState([]);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Função para carregar os dados do Google Sheets
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Busca os dados do Google Sheets
        const data = await fetchAllData();
        
        // Atualiza o estado com os dados obtidos
        setModels(data.models);
        setMatches(data.matches);
        setPredictions(data.predictions);
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Não foi possível carregar os dados da planilha. Usando dados de fallback.');
        
        // Usa os dados estáticos como fallback em caso de erro
        setModels(modelsData);
        setMatches(matchesData);
        setPredictions(predictionsData);
        
        setLoading(false);
      }
    }

    // Chama a função para carregar os dados
    loadData();
  }, []);

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
        </header>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
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