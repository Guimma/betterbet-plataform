import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ models, matches, predictions }) => {
  // Estatísticas para resumo
  const totalMatches = matches.length;
  const totalPredictions = predictions.length;
  const totalModels = models.length;
  
  // Calcular média de acurácia dos modelos
  const avgAccuracy = models.length > 0 
    ? (models.reduce((acc, model) => acc + parseFloat(model.accuracy), 0) / models.length).toFixed(2) + '%'
    : 'N/A';
  
  // Dados para gráfico de distribuição de previsões
  const predictionDistribution = [
    { name: 'Over 2.5', value: predictions.filter(p => p.prediction === 'OVER_2.5').length },
    { name: 'Over 1.5', value: predictions.filter(p => p.prediction === 'OVER_1.5').length },
    { name: 'Over 0.5', value: predictions.filter(p => p.prediction === 'OVER_0.5').length }
  ];
  
  const COLORS = ['#3498db', '#27ae60', '#f39c12'];

  // Próximas partidas com previsões
  const upcomingMatches = predictions
    .filter(p => new Date(p.match_date) > new Date())
    .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
    .slice(0, 5);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total de Partidas</span>
          <span className="stat-value">{totalMatches}</span>
          <Link to="/matches">Ver todas</Link>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Previsões</span>
          <span className="stat-value">{totalPredictions}</span>
          <Link to="/predictions">Ver detalhes</Link>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Modelos</span>
          <span className="stat-value">{totalModels}</span>
          <Link to="/models">Ver todos</Link>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Acurácia Média</span>
          <span className="stat-value">{avgAccuracy}</span>
          <span>Baseado em todos os modelos</span>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2>Distribuição de Previsões</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={predictionDistribution}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {predictionDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'Quantidade']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2>Próximas Partidas com Previsões</h2>
        </div>
        {upcomingMatches.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Partida</th>
                <th>Previsão</th>
                <th>Probabilidade</th>
                <th>Odd</th>
              </tr>
            </thead>
            <tbody>
              {upcomingMatches.map((match) => (
                <tr key={match.match_id}>
                  <td>{new Date(match.match_date).toLocaleDateString('pt-BR')}</td>
                  <td>{match.home_team_name} vs {match.away_team_name}</td>
                  <td>
                    <span className="badge badge-success">{match.prediction}</span>
                  </td>
                  <td>{match.probability}</td>
                  <td>
                    {match.prediction === 'OVER_2.5' && match['odd over 2.5']}
                    {match.prediction === 'OVER_1.5' && match['odd over 1.5']}
                    {match.prediction === 'OVER_0.5' && match['odd over 0.5']}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Não há partidas previstas para os próximos dias.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 