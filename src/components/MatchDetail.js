import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const MatchDetail = ({ matches, predictions }) => {
  const { id } = useParams();
  const match = matches.find(m => m.match_id === id);
  const prediction = predictions.find(p => p.match_id === id);
  
  if (!match) {
    return (
      <div className="match-detail-page">
        <h1>Detalhes da Partida</h1>
        <div className="card">
          <p>Partida não encontrada. ID: {id}</p>
          <Link to="/matches">Voltar para lista de partidas</Link>
        </div>
      </div>
    );
  }
  
  // Dados para o gráfico de comparação de estatísticas
  const statsData = [
    {
      category: 'Posse de Bola',
      home: parseInt(match.home_team_possession) || 0,
      away: parseInt(match.away_team_possession) || 0,
    },
    {
      category: 'Finalizações',
      home: parseInt(match.home_team_shots) || 0,
      away: parseInt(match.away_team_shots) || 0,
    },
    {
      category: 'Finalizações no Gol',
      home: parseInt(match.home_team_shots_on_target) || 0,
      away: parseInt(match.away_team_shots_on_target) || 0,
    },
    {
      category: 'xG',
      home: parseFloat(match.home_team_xg) || 0,
      away: parseFloat(match.away_team_xg) || 0,
    }
  ];
  
  // Dados para o radar chart
  const radarData = [
    { subject: 'Posse', A: match.home_team_possession || 0, B: match.away_team_possession || 0, fullMark: 100 },
    { subject: 'Finalizações', A: match.home_team_shots || 0, B: match.away_team_shots || 0, fullMark: 30 },
    { subject: 'No Gol', A: match.home_team_shots_on_target || 0, B: match.away_team_shots_on_target || 0, fullMark: 15 },
    { subject: 'xG', A: (match.home_team_xg || 0) * 10, B: (match.away_team_xg || 0) * 10, fullMark: 30 }
  ];
  
  // Função para formatar data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  // Calcular a porcentagem de acertos nas finalizações
  const homeAccuracy = match.home_team_shots > 0 
    ? ((match.home_team_shots_on_target / match.home_team_shots) * 100).toFixed(1) 
    : 0;
    
  const awayAccuracy = match.away_team_shots > 0 
    ? ((match.away_team_shots_on_target / match.away_team_shots) * 100).toFixed(1) 
    : 0;
  
  // Verificar se a partida já ocorreu
  const matchDate = new Date(match.match_date);
  const matchHasOccurred = matchDate < new Date();
  
  // Total de gols
  const totalGoals = parseInt(match.home_team_score || 0) + parseInt(match.away_team_score || 0);
  
  // Verificar resultado do Over 2.5
  const isOver25 = totalGoals > 2.5;
  const isOver15 = totalGoals > 1.5;
  const isOver05 = totalGoals > 0.5;

  return (
    <div className="match-detail-page">
      <h1>Detalhes da Partida</h1>
      
      <div className="card">
        <div className="card-header">
          <h2>{match.home_team_name} vs {match.away_team_name}</h2>
          <span>{formatDate(match.match_date)}</span>
        </div>
        
        <div className="match-score-display">
          <div className="team-info">
            <h3>{match.home_team_name}</h3>
            <span className="team-score">{match.home_team_score || '-'}</span>
          </div>
          <div className="vs-separator">X</div>
          <div className="team-info">
            <h3>{match.away_team_name}</h3>
            <span className="team-score">{match.away_team_score || '-'}</span>
          </div>
        </div>
        
        {prediction && (
          <div className="prediction-info">
            <h3>Previsão do modelo:</h3>
            <p>
              <strong>{prediction.prediction}</strong> 
              (Probabilidade: {prediction.probability}, 
              Odd: {
                prediction.prediction === 'OVER_2.5' ? prediction['odd over 2.5'] :
                prediction.prediction === 'OVER_1.5' ? prediction['odd over 1.5'] :
                prediction['odd over 0.5']
              })
            </p>
            
            {matchHasOccurred && (
              <div className="prediction-result">
                <p>
                  <strong>Resultado da Previsão:</strong>{' '}
                  {(prediction.prediction === 'OVER_2.5' && isOver25) ||
                   (prediction.prediction === 'OVER_1.5' && isOver15) ||
                   (prediction.prediction === 'OVER_0.5' && isOver05)
                    ? <span className="badge badge-success">ACERTO</span>
                    : <span className="badge badge-warning">ERRO</span>
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">xG Casa</span>
          <span className="stat-value">{match.home_team_xg || '0.00'}</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">xG Visitante</span>
          <span className="stat-value">{match.away_team_xg || '0.00'}</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Acurácia Casa</span>
          <span className="stat-value">{homeAccuracy}%</span>
          <span>{match.home_team_shots_on_target} de {match.home_team_shots} no gol</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Acurácia Visitante</span>
          <span className="stat-value">{awayAccuracy}%</span>
          <span>{match.away_team_shots_on_target} de {match.away_team_shots} no gol</span>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2>Comparação de Estatísticas</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={statsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="category" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="home" name={match.home_team_name} fill="#3498db" />
            <Bar dataKey="away" name={match.away_team_name} fill="#e74c3c" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2>Análise Comparativa</h2>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart outerRadius={150} data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis />
            <Radar name={match.home_team_name} dataKey="A" stroke="#3498db" fill="#3498db" fillOpacity={0.6} />
            <Radar name={match.away_team_name} dataKey="B" stroke="#e74c3c" fill="#e74c3c" fillOpacity={0.6} />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="navigation-links">
        <Link to="/matches">Voltar para lista de partidas</Link>
        {prediction && <Link to="/predictions">Ver todas as previsões</Link>}
      </div>
    </div>
  );
};

export default MatchDetail; 