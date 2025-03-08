/**
 * Configuração do Google Sheets
 * 
 * Você precisa compartilhar sua planilha com o email da conta de serviço:
 * lucas-campregher@lofty-mark-407721.iam.gserviceaccount.com
 */

// Substitua estes valores pelos seus IDs específicos
export const SHEETS_CONFIG = {
  // ID da planilha - você pode obtê-lo da URL da sua planilha
  // Ex: https://docs.google.com/spreadsheets/d/SEU_ID_DA_PLANILHA/edit
  spreadsheetId: 'seu_id_da_planilha_aqui',
  
  // Nomes das abas e ranges que você quer carregar
  sheets: {
    models: 'Models!A1:Z1000',    // Aba de modelos
    matches: 'Matches!A1:Z1000',  // Aba de partidas
    predictions: 'Predictions!A1:Z1000', // Aba de previsões
  }
}; 