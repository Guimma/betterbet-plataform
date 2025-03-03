import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Matches = ({ matches }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'match_date', direction: 'desc' });
  const itemsPerPage = 10;

  // Função para ordenar
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtrar partidas com base na pesquisa
  const filteredMatches = matches.filter(match => 
    match.home_team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.away_team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar partidas
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Lógica de paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMatches = sortedMatches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedMatches.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Função para formatar data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="matches-page">
      <h1>Partidas</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por equipe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2>Lista de Partidas ({filteredMatches.length})</h2>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('match_date')}>
                Data {sortConfig.key === 'match_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Partida</th>
              <th>Placar</th>
              <th onClick={() => requestSort('home_team_xg')}>
                xG Casa {sortConfig.key === 'home_team_xg' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('away_team_xg')}>
                xG Visitante {sortConfig.key === 'away_team_xg' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('home_team_possession')}>
                Posse Casa {sortConfig.key === 'home_team_possession' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('away_team_possession')}>
                Posse Visitante {sortConfig.key === 'away_team_possession' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {currentMatches.map((match) => (
              <tr key={match.match_id}>
                <td>{formatDate(match.match_date)}</td>
                <td>{match.home_team_name} vs {match.away_team_name}</td>
                <td>{match.home_team_score} - {match.away_team_score}</td>
                <td>{match.home_team_xg}</td>
                <td>{match.away_team_xg}</td>
                <td>{match.home_team_possession}%</td>
                <td>{match.away_team_possession}%</td>
                <td>
                  <Link to={`/match/${match.match_id}`}>Ver detalhes</Link>
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
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Média de Gols por Partida</span>
          <span className="stat-value">
            {(matches.reduce((acc, match) => 
              acc + parseInt(match.home_team_score || 0) + parseInt(match.away_team_score || 0), 0) / matches.length).toFixed(2)}
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">% Partidas com Over 2.5</span>
          <span className="stat-value">
            {(matches.filter(match => 
              parseInt(match.home_team_score || 0) + parseInt(match.away_team_score || 0) > 2.5
            ).length / matches.length * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">% Vitórias Mandantes</span>
          <span className="stat-value">
            {(matches.filter(match => 
              parseInt(match.home_team_score || 0) > parseInt(match.away_team_score || 0)
            ).length / matches.length * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">% Empates</span>
          <span className="stat-value">
            {(matches.filter(match => 
              parseInt(match.home_team_score || 0) === parseInt(match.away_team_score || 0)
            ).length / matches.length * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default Matches; 