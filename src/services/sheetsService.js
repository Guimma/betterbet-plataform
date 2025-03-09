/**
 * Serviço para obter dados do Google Sheets diretamente via API
 * Utiliza autenticação do usuário para acessar planilhas privadas
 */

import { isUserAuthenticated, initializeGoogleApi, hasRequiredScopes } from './googleAuthService';

// ID da planilha do Google Sheets
const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;

// Ative para ver logs detalhados no console
const DEBUG = true;

// Cache de informações da planilha
let sheetsMetadata = null;

// Função para logging detalhado, facilita o debug
function logDebug(message, data) {
  if (DEBUG) {
    console.log(`[SheetsService] ${message}`, data || '');
  }
}

// Função para logging de erros
function logError(message, error) {
  console.error(`[SheetsService ERROR] ${message}`, error);
  if (error && error.response) {
    console.error('Response details:', error.response);
  }
}

/**
 * Garante que a API do Google esteja inicializada
 */
async function ensureApiInitialized() {
  try {
    await initializeGoogleApi();
  } catch (error) {
    logError('Falha ao inicializar a API do Google:', error);
    throw new Error('Não foi possível inicializar a API do Google. Verifique as configurações e tente novamente.');
  }
}

/**
 * Busca metadados da planilha para verificar as abas disponíveis
 * @returns {Promise<Array>} Lista de abas disponíveis
 */
async function fetchSheetMetadata() {
  try {
    if (sheetsMetadata) {
      return sheetsMetadata;
    }

    logDebug(`Buscando metadados da planilha: ${SPREADSHEET_ID}`);
    
    const response = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });
    
    if (!response || response.status !== 200) {
      throw new Error(`Erro ao buscar metadados: ${response ? response.status : 'Resposta vazia'}`);
    }
    
    const metadata = response.result;
    sheetsMetadata = metadata;
    
    logDebug('Metadados da planilha obtidos com sucesso', metadata);
    
    // Extrair nomes das abas para facilitar o log
    const sheetNames = metadata.sheets.map(sheet => sheet.properties.title);
    logDebug('Abas disponíveis na planilha:', sheetNames);
    
    return metadata;
  } catch (error) {
    logError('Falha ao buscar metadados da planilha:', error);
    throw error;
  }
}

/**
 * Verifica se uma aba específica existe na planilha
 * @param {string} sheetName Nome da aba para verificar
 * @returns {Promise<boolean>} true se a aba existir
 * @private Função interna, não utilizada diretamente
 */
// eslint-disable-next-line no-unused-vars
async function sheetExists(sheetName) {
  try {
    const metadata = await fetchSheetMetadata();
    const exists = metadata.sheets.some(sheet => 
      sheet.properties.title.toLowerCase() === sheetName.toLowerCase()
    );
    
    if (!exists) {
      logDebug(`Aba "${sheetName}" não encontrada na planilha. Abas disponíveis:`, 
        metadata.sheets.map(sheet => sheet.properties.title)
      );
    }
    
    return exists;
  } catch (error) {
    logError(`Erro ao verificar existência da aba ${sheetName}:`, error);
    return false;
  }
}

/**
 * Obtém o nome correto da aba com a caixa exata (case-sensitive)
 * @param {string} sheetName Nome aproximado da aba
 * @returns {Promise<string|null>} Nome correto da aba ou null se não existir
 */
async function getCorrectSheetName(sheetName) {
  try {
    const metadata = await fetchSheetMetadata();
    const sheet = metadata.sheets.find(s => 
      s.properties.title.toLowerCase() === sheetName.toLowerCase()
    );
    
    return sheet ? sheet.properties.title : null;
  } catch (error) {
    logError(`Erro ao obter nome correto da aba ${sheetName}:`, error);
    return null;
  }
}

/**
 * Converte dados da API para formato de objetos
 * @param {Array} values Valores retornados pela API
 * @returns {Array} Array de objetos com chave/valor
 */
function convertToObjects(values) {
  if (!values || !Array.isArray(values) || values.length < 2) {
    return [];
  }
  
  try {
    // A primeira linha contém os cabeçalhos
    const headers = values[0];
    const rows = values.slice(1);
    
    return rows.map(row => {
      const item = {};
      headers.forEach((header, index) => {
        // Verifica se o header é válido antes de usar como chave
        if (header && typeof header === 'string') {
          item[header] = index < row.length ? row[index] : '';
        }
      });
      return item;
    });
  } catch (error) {
    logError('Erro ao converter dados para objetos:', error);
    return [];
  }
}

/**
 * Busca dados de uma aba específica da planilha
 * @param {string} sheetName - Nome da aba a buscar
 * @returns {Promise<Array>} - Os dados da aba como um array de objetos
 */
export async function fetchSheetData(sheetName) {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('ID da planilha não configurado. Verifique a variável de ambiente REACT_APP_SPREADSHEET_ID.');
    }

    // Garante que a API esteja inicializada
    await ensureApiInitialized();
    
    // Verifica se o usuário está autenticado
    if (!isUserAuthenticated()) {
      throw new Error('Usuário não autenticado. Faça login para acessar os dados da planilha.');
    }
    
    // Verifica se o usuário tem os escopos necessários
    if (!hasRequiredScopes()) {
      throw new Error('Permissões insuficientes. O aplicativo precisa de permissão para acessar o Google Sheets (somente leitura).');
    }
    
    // Verifica se a aba existe e obtém o nome correto (preservando maiúsculas/minúsculas)
    const correctSheetName = await getCorrectSheetName(sheetName);
    
    if (!correctSheetName) {
      logError(`Aba "${sheetName}" não encontrada na planilha.`);
      return [];
    }
    
    // Formato correto do range: "NomeDaAba!A1:Z1000"
    const range = `${correctSheetName}!A1:Z1000`;
    
    logDebug(`Buscando dados do range: ${range}`);
    
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range
    });
    
    logDebug(`Resposta para ${range}: Status ${response.status}`);
    
    if (!response || response.status !== 200) {
      throw new Error(`Erro ao buscar dados: ${response ? response.status : 'Resposta vazia'}`);
    }
    
    const result = response.result;
    
    if (!result || !result.values) {
      logDebug(`Planilha ${sheetName} está vazia ou não contém dados`);
      return [];
    }
    
    if (result.values.length < 2) {
      logDebug(`Planilha ${sheetName} não tem dados suficientes (apenas cabeçalho)`);
      return [];
    }
    
    // Converte os dados para um formato de objetos
    const data = convertToObjects(result.values);
    
    logDebug(`Recebidos ${data.length} registros para ${sheetName}`);
    return data;
  } catch (error) {
    // Verifica se é um erro de formato de range
    if (error.status === 400 && error.message && error.message.includes('parse range')) {
      logError(`Erro de formato no range para aba "${sheetName}". Verifique se a aba existe e está com o nome correto.`, error);
      return [];
    }
    
    logError(`Erro ao buscar dados da aba ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Busca todos os dados configurados da planilha
 * @returns {Promise<Object>} - Objeto contendo todos os dados organizados por tipo
 */
export async function fetchAllData() {
  try {
    logDebug('Iniciando busca de todos os dados');
    
    // Garante que a API esteja inicializada e busca metadata primeiro
    await ensureApiInitialized();
    const metadata = await fetchSheetMetadata();
    
    // Obtém lista de todas as abas disponíveis
    const availableSheets = metadata.sheets.map(sheet => sheet.properties.title);
    logDebug('Abas disponíveis na planilha:', availableSheets);
    
    // Lista das abas que queremos buscar (preferencialmente)
    const targetSheets = ['Apostas', 'Jogos', 'Times', 'Usuarios'];
    
    // Filtra para obter apenas as abas que existem
    const sheetsToFetch = targetSheets.filter(sheet => 
      availableSheets.some(available => available.toLowerCase() === sheet.toLowerCase())
    );
    
    if (sheetsToFetch.length === 0) {
      logDebug('Nenhuma das abas solicitadas foi encontrada. Usando todas as abas disponíveis.');
      // Se nenhuma das abas específicas foi encontrada, usa todas disponíveis
      sheetsToFetch.push(...availableSheets);
    }
    
    logDebug('Buscando dados das abas:', sheetsToFetch);
    
    // Busca os dados de todas as abas em paralelo
    const results = await Promise.all(
      sheetsToFetch.map(async (sheet) => {
        try {
          const data = await fetchSheetData(sheet);
          // Usar o nome exato da aba como chave
          return { [sheet]: data };
        } catch (error) {
          logError(`Erro ao buscar aba ${sheet}`, error);
          return { [sheet]: [] };
        }
      })
    );
    
    // Combina os resultados em um único objeto
    const combinedData = results.reduce((acc, result) => ({ ...acc, ...result }), {});
    
    // Adiciona também versões em lowercase das chaves para facilitar o acesso
    Object.keys(combinedData).forEach(key => {
      combinedData[key.toLowerCase()] = combinedData[key];
    });
    
    logDebug('Dados carregados com sucesso', {
      totalSheets: Object.keys(combinedData).length / 2, // Divide por 2 porque temos as chaves originais e em lowercase
      keys: Object.keys(combinedData)
    });
    
    return combinedData;
  } catch (error) {
    logError('Erro ao buscar todos os dados:', error);
    throw error;
  }
}

/**
 * Verifica se o serviço está acessível
 * @returns {Promise<Object>} - Status da verificação
 */
export async function checkServiceHealth() {
  try {
    if (!SPREADSHEET_ID) {
      return {
        accessible: false,
        message: 'ID da planilha não configurado'
      };
    }

    await ensureApiInitialized();
    
    // Se o usuário não estiver autenticado, retorna que precisamos de login
    if (!isUserAuthenticated()) {
      return {
        accessible: false,
        status: 401,
        message: 'Autenticação necessária',
        requiresAuth: true
      };
    }
    
    // Verifica se o usuário tem todos os escopos necessários
    if (!hasRequiredScopes()) {
      return {
        accessible: false,
        status: 403,
        message: 'Permissões insuficientes para acessar o Google Sheets',
        requiresAuth: true,
        requiresScopes: true
      };
    }
    
    // Tenta buscar os metadados da planilha como teste
    try {
      await fetchSheetMetadata();
      
      return {
        accessible: true,
        status: 200,
        message: 'Serviço acessível'
      };
    } catch (error) {
      return {
        accessible: false,
        message: `Erro ao verificar serviço: ${error.message}`,
        error: error
      };
    }
  } catch (error) {
    return {
      accessible: false,
      message: `Erro ao inicializar API: ${error.message}`,
      error: error
    };
  }
} 