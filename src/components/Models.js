import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Models = ({ models }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar modelos com base na pesquisa
  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentModels = filteredModels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredModels.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="models-page">
      <h1>Modelos de Previsão</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nome, tipo ou alvo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2>Lista de Modelos ({filteredModels.length})</h2>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Versão</th>
              <th>Data</th>
              <th>Tipo</th>
              <th>Modelo</th>
              <th>Alvo</th>
              <th>Partidas</th>
              <th>Acurácia</th>
            </tr>
          </thead>
          <tbody>
            {currentModels.map((model, index) => (
              <tr key={index}>
                <td>{model.name}</td>
                <td>{model.version}</td>
                <td>{model.date}</td>
                <td>{model.type}</td>
                <td>{model.model}</td>
                <td>{model.target}</td>
                <td>{model.num_matches}</td>
                <td>
                  <span 
                    className={`badge ${
                      parseFloat(model.accuracy) >= 65 ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    {model.accuracy}
                  </span>
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
      
      <div className="card">
        <div className="card-header">
          <h2>Distribuição de Acurácia</h2>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { range: '<50%', count: models.filter(m => parseFloat(m.accuracy) < 50).length },
                { range: '50-60%', count: models.filter(m => parseFloat(m.accuracy) >= 50 && parseFloat(m.accuracy) < 60).length },
                { range: '60-70%', count: models.filter(m => parseFloat(m.accuracy) >= 60 && parseFloat(m.accuracy) < 70).length },
                { range: '70-80%', count: models.filter(m => parseFloat(m.accuracy) >= 70 && parseFloat(m.accuracy) < 80).length },
                { range: '>80%', count: models.filter(m => parseFloat(m.accuracy) >= 80).length }
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Quantidade de Modelos" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Models; 