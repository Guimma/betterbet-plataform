import { google } from 'googleapis';
import { SHEETS_CONFIG } from '../config/sheets';
import credentials from '../config/credentials.json';

// Configura a autenticação usando as credenciais da conta de serviço
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets.readonly']
);

// Cria uma instância da API do Google Sheets
const sheets = google.sheets({ version: 'v4', auth });

/**
 * Converte um array de arrays em um array de objetos usando a primeira linha como chaves
 */
function convertToObjects(data) {
  if (!data || !data.length) return [];
  
  const headers = data[0];
  return data.slice(1).map(row => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    return item;
  });
}

/**
 * Busca dados de uma aba específica da planilha
 * @param {string} sheetName - Nome da aba na configuração (models, matches, predictions)
 * @returns {Promise<Array>} - Os dados da aba como um array de objetos
 */
export async function fetchSheetData(sheetName) {
  try {
    const range = SHEETS_CONFIG.sheets[sheetName];
    
    if (!range) {
      throw new Error(`Configuração para a aba ${sheetName} não encontrada`);
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_CONFIG.spreadsheetId,
      range,
    });
    
    return convertToObjects(response.data.values || []);
  } catch (error) {
    console.error(`Erro ao buscar dados da aba ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Busca todos os dados configurados da planilha
 * @returns {Promise<Object>} - Objeto contendo todos os dados organizados por tipo
 */
export async function fetchAllData() {
  try {
    const [models, matches, predictions] = await Promise.all([
      fetchSheetData('models'),
      fetchSheetData('matches'),
      fetchSheetData('predictions'),
    ]);
    
    return {
      models,
      matches,
      predictions
    };
  } catch (error) {
    console.error('Erro ao buscar todos os dados:', error);
    throw error;
  }
} 