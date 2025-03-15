const { google } = require('googleapis');
require('dotenv').config();

// IDs e configurações
const SPREADSHEET_ID = '1s6yH18kVyOi9erq8xI7gnOAUoW6Jp0AngKQUWufn7Do';
const SHEET_RANGES = {
  models: 'Models!A1:Z1000',
  matches: 'Matches!A1:Z1000',
  predictions: 'Predictions!A1:Z1000'
};

// Função para converter os resultados em um array de objetos usando a primeira linha como cabeçalhos
function convertToObjects(data) {
  if (!data || data.length < 2) return [];
  
  const headers = data[0];
  return data.slice(1).map(row => {
    const item = {};
    headers.forEach((header, index) => {
      // Converte para números quando possível
      let value = row[index];
      if (value && !isNaN(value) && value.trim() !== '') {
        value = Number(value);
      }
      item[header] = value;
    });
    return item;
  });
}

exports.handler = async (event, context) => {
  // Permitir CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
  
  // Responder a preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  // Obter o nome da aba dos parâmetros da requisição
  const params = event.queryStringParameters || {};
  const sheetName = params.sheet || 'models';
  
  // Verificar se a aba solicitada é válida
  if (!SHEET_RANGES[sheetName.toLowerCase()]) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Aba inválida: ${sheetName}` })
    };
  }
  
  try {
    console.log(`Buscando dados da aba: ${sheetName}`);
    
    // Configurar autenticação usando a conta de serviço
    // IMPORTANTE: Essas credenciais devem ser armazenadas em variáveis de ambiente
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'lucas-campregher@lofty-mark-407721.iam.gserviceaccount.com',
      null,
      // O formato da chave privada precisa ser ajustado para funcionar corretamente
      (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );
    
    // Criar cliente do Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Obter dados da planilha
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGES[sheetName.toLowerCase()]
    });
    
    // Converter para objetos
    const results = convertToObjects(response.data.values);
    
    console.log(`Obtidos ${results.length} registros da aba ${sheetName}`);
    
    // Retornar dados
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: results })
    };
  } catch (error) {
    console.error('Erro ao buscar dados da planilha:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao buscar dados da planilha',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : null
      })
    };
  }
}; 