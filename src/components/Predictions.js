import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Predictions = ({ predictions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const itemsPerPage = 10;

  // Filtrar previsões com base na pesquisa e no filtro
  const filteredPredictions = predictions.filter(prediction => {
    const matchesSearch = 
      prediction.home_team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prediction.away_team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prediction.prediction.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const matchDate = new Date(prediction.match_date);
    
    if (filter === 'upcoming') {
      return matchesSearch && matchDate > now;
    } else if (filter === 'past') {
      return matchesSearch && matchDate <= now;
    }
    
    return matchesSearch;
  });

  // Ordenar previsões por data
  const sortedPredictions = [...filteredPredictions].sort((a, b) => 
    new Date(a.match_date) - new Date(b.match_date)
  );

  // Lógica de paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPredictions = sortedPredictions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPredictions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Dados para o gráfico de distribuição de previsões
  const predictionTypes = ['OVER_2.5', 'OVER_1.5', 'OVER_0.5'];
  const predictionDistribution = predictionTypes.map(type => ({
    name: type,
    value: predictions.filter(p => p.prediction === type).length
  }));
  
  const COLORS = ['#3498db', '#27ae60', '#f39c12'];

  // Função para formatar data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="predictions-page">
      <h1>Previsões</h1>
      
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por equipe ou tipo de previsão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button 
            className={filter === 'upcoming' ? 'active' : ''} 
            onClick={() => setFilter('upcoming')}
          >
            Próximas
          </button>
          <button 
            className={filter === 'past' ? 'active' : ''} 
            onClick={() => setFilter('past')}
          >
            Encerradas
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total de Previsões</span>
          <span className="stat-value">{predictions.length}</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Previsões Over 2.5</span>
          <span className="stat-value">
            {predictions.filter(p => p.prediction === 'OVER_2.5').length}
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Confiança Média</span>
          <span className="stat-value">
            {predictions.length > 0 
              ? (predictions.reduce((acc, p) => acc + parseFloat(p.probability), 0) / predictions.length).toFixed(2) + '%'
              : 'N/A'
            }
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Odd Média (Over 2.5)</span>
          <span className="stat-value">
            {predictions.filter(p => p['odd over 2.5']).length > 0
              ? (predictions.filter(p => p['odd over 2.5']).reduce((acc, p) => acc + parseFloat(p['odd over 2.5']), 0) / 
                predictions.filter(p => p['odd over 2.5']).length).toFixed(2)
              : 'N/A'
            }
          </span>
        </div>
      </div>
      
      <div className="charts-section">
        <div className="card">
          <div className="card-header">
            <h2>Distribuição de Tipos de Previsão</h2>
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
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2>Lista de Previsões ({filteredPredictions.length})</h2>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Partida</th>
              <th>Previsão</th>
              <th>Probabilidade</th>
              <th>Odd</th>
              <th>Resultado</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {currentPredictions.map((prediction) => (
              <tr key={prediction.match_id}>
                <td>{formatDate(prediction.match_date)}</td>
                <td>{prediction.home_team_name} vs {prediction.away_team_name}</td>
                <td>
                  <span className="badge badge-success">{prediction.prediction}</span>
                </td>
                <td>{prediction.probability}</td>
                <td>
                  {prediction.prediction === 'OVER_2.5' && prediction['odd over 2.5']}
                  {prediction.prediction === 'OVER_1.5' && prediction['odd over 1.5']}
                  {prediction.prediction === 'OVER_0.5' && prediction['odd over 0.5']}
                </td>
                <td>
                  {prediction.result ? 
                    <span className={`badge ${prediction.result === 'WIN' ? 'badge-success' : 'badge-warning'}`}>
                      {prediction.result}
                    </span> : 
                    'Pendente'
                  }
                </td>
                <td>
                  <Link to={`/match/${prediction.match_id}`}>Ver detalhes</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              &laquo;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={currentPage === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions; 