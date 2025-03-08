import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Models from './components/Models';
import Matches from './components/Matches';
import Predictions from './components/Predictions';
import MatchDetail from './components/MatchDetail';
import './App.css';

// Dados simulados (na aplicação real, estes viriam de um backend)
import modelsData from './data/models';
import matchesData from './data/matches';
import predictionsData from './data/predictions';

function App() {
  const [models, setModels] = useState([]);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula carregamento de dados de API
    setTimeout(() => {
      setModels(modelsData);
      setMatches(matchesData);
      setPredictions(predictionsData);
      setLoading(false);
    }, 1000);
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