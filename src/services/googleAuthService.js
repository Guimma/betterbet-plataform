import { gapi } from 'gapi-script';

// Configurações do Google API
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];

// Determinar a origem da aplicação para configurações da API
const APP_ORIGIN = window.location.origin;

// Debug flag
const DEBUG = true;

let authInstance = null;
let isInitialized = false;
let isAuthenticated = false;

// Função para debug condicional
const logDebug = (message, data) => {
  if (DEBUG) {
    console.log(`[GoogleAuthService] ${message}`, data || '');
  }
};

/**
 * Verifica se os escopos necessários foram concedidos
 * @returns {boolean} true se os escopos foram concedidos
 */
const checkScopes = () => {
  if (!isInitialized || !isAuthenticated) {
    return false;
  }
  
  try {
    const currentUser = authInstance.currentUser.get();
    const authResponse = currentUser.getAuthResponse(true);
    const grantedScopes = authResponse.scope.split(' ');
    
    logDebug('Escopos concedidos:', grantedScopes);
    
    // Verifica se o escopo do Google Sheets foi concedido
    const sheetsScope = 'https://www.googleapis.com/auth/spreadsheets.readonly';
    const hasSheetsScope = grantedScopes.includes(sheetsScope);
    
    logDebug('Escopo do Google Sheets concedido:', hasSheetsScope);
    
    return hasSheetsScope;
  } catch (error) {
    console.error('[GoogleAuthService] Erro ao verificar escopos:', error);
    return false;
  }
};

/**
 * Inicializa a API do Google
 * @returns {Promise} Promessa que resolve quando a API estiver inicializada
 */
export const initializeGoogleApi = () => {
  return new Promise((resolve, reject) => {
    // Se já está inicializado, retorna
    if (isInitialized) {
      resolve(true);
      return;
    }
    
    // Verifica se as configurações necessárias estão presentes
    if (!API_KEY) {
      console.error('[GoogleAuthService] API_KEY não configurada');
      reject(new Error('Chave de API do Google não configurada. Verifique o arquivo .env.local'));
      return;
    }

    if (!CLIENT_ID) {
      console.error('[GoogleAuthService] CLIENT_ID não configurado');
      reject(new Error('ID do cliente OAuth não configurado. Verifique o arquivo .env.local'));
      return;
    }

    logDebug('Iniciando carregamento da API Google');
    logDebug('CLIENT_ID configurado:', CLIENT_ID ? 'Sim' : 'Não');
    logDebug('Solicitando escopo:', SCOPES);
    logDebug('Ambiente de execução:', process.env.NODE_ENV);
    logDebug('Origem da aplicação:', APP_ORIGIN);

    // Verifica se o script já foi carregado
    if (typeof window.gapi !== 'undefined') {
      initClient(resolve, reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      logDebug('Script da API Google carregado');
      initClient(resolve, reject);
    };
    
    script.onerror = (error) => {
      console.error('[GoogleAuthService] Falha ao carregar o script da API:', error);
      reject(error);
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Inicializa o cliente da API Google
 */
const initClient = (resolve, reject) => {
  gapi.load('client:auth2', () => {
    try {
      logDebug('Inicializando cliente gapi');
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
        ux_mode: 'popup',  // Usar modo popup para evitar problemas com redirecionamento
        cookie_policy: 'single_host_origin'  // Política de cookies restritiva
      }).then(() => {
        logDebug('Cliente gapi inicializado com sucesso');
        authInstance = gapi.auth2.getAuthInstance();
        isInitialized = true;
        isAuthenticated = authInstance.isSignedIn.get();
        
        // Monitorar alterações no status de autenticação
        authInstance.isSignedIn.listen((signedIn) => {
          isAuthenticated = signedIn;
          logDebug('Status de autenticação alterado:', signedIn);
          
          if (signedIn) {
            checkScopes();
          }
        });
        
        // Se o usuário já estiver autenticado, verifica os escopos
        if (isAuthenticated) {
          checkScopes();
        }
        
        logDebug('API inicializada com sucesso');
        resolve(true);
      }).catch((error) => {
        console.error('[GoogleAuthService] Erro ao inicializar API:', error);
        
        // Gerar mensagem de erro mais detalhada
        let errorMsg = 'Erro ao inicializar API do Google: ';
        
        if (error.details) {
          errorMsg += error.details;
        } else if (error.message) {
          errorMsg += error.message;
        }
        
        if (error.status === 403) {
          errorMsg += '\nVerifique as configurações do seu projeto no Google Cloud Console:';
          errorMsg += `\n1. Adicione ${APP_ORIGIN} às origens JavaScript autorizadas`;
          errorMsg += '\n2. Verifique se a API do Google Sheets está habilitada';
          errorMsg += '\n3. Certifique-se de que seu email está na lista de usuários de teste';
        }
        
        reject(new Error(errorMsg));
      });
    } catch (error) {
      console.error('[GoogleAuthService] Erro durante a inicialização:', error);
      reject(error);
    }
  });
};

/**
 * Faz login usando a conta Google do usuário
 * @returns {Promise<Object>} Promessa com os dados do usuário logado
 */
export const signIn = async () => {
  if (!isInitialized) {
    try {
      await initializeGoogleApi();
    } catch (error) {
      throw new Error(`Falha ao inicializar API: ${error.message}`);
    }
  }
  
  try {
    logDebug('Iniciando processo de login');
    
    // Opções para solicitar todos os escopos novamente
    const options = {
      prompt: 'consent',
      scope: SCOPES,
      ux_mode: 'popup'  // Forçar modo popup
    };
    
    const googleUser = await authInstance.signIn(options);
    const profile = googleUser.getBasicProfile();
    isAuthenticated = true;
    
    logDebug('Login realizado com sucesso');
    
    // Verificar os escopos concedidos
    const hasRequiredScopes = checkScopes();
    
    if (!hasRequiredScopes) {
      console.warn('[GoogleAuthService] Aviso: Escopo do Google Sheets não foi concedido!');
      console.warn('[GoogleAuthService] O acesso à planilha pode falhar.');
    }
    
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl()
    };
  } catch (error) {
    console.error('[GoogleAuthService] Erro ao fazer login:', error);
    
    let errorMsg = 'Falha ao fazer login com o Google: ';
    
    if (error.error === 'popup_blocked_by_browser') {
      errorMsg = 'O pop-up de login foi bloqueado pelo navegador. Por favor, permita pop-ups para este site.';
    } else if (error.error === 'access_denied') {
      errorMsg = 'Acesso negado. Verifique se seu projeto no Google Cloud Console está configurado corretamente:';
      errorMsg += `\n1. Adicione ${APP_ORIGIN} às origens JavaScript autorizadas`;
      errorMsg += '\n2. Se o projeto está em modo de teste, adicione seu email à lista de usuários de teste';
      errorMsg += '\n3. Verifique se o escopo "https://www.googleapis.com/auth/spreadsheets.readonly" está permitido na tela de consentimento OAuth';
    } else if (error.message) {
      errorMsg += error.message;
    }
    
    throw new Error(errorMsg);
  }
};

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} true se estiver autenticado
 */
export const isUserAuthenticated = () => {
  return isAuthenticated;
};

/**
 * Verifica se o usuário tem todos os escopos necessários
 * @returns {boolean} true se tiver todos os escopos
 */
export const hasRequiredScopes = () => {
  return checkScopes();
};

/**
 * Faz logout da conta Google
 * @returns {Promise} Promessa que resolve quando o logout for concluído
 */
export const signOut = async () => {
  if (!isInitialized) {
    return false;
  }
  
  try {
    await authInstance.signOut();
    isAuthenticated = false;
    logDebug('Logout realizado com sucesso');
    return true;
  } catch (error) {
    console.error('[GoogleAuthService] Erro ao fazer logout:', error);
    throw error;
  }
};

/**
 * Obtém o token de acesso atual
 * @returns {string|null} Token de acesso ou null se não estiver autenticado
 */
export const getAccessToken = () => {
  if (!isInitialized || !isAuthenticated) {
    return null;
  }
  
  try {
    const authResponse = authInstance.currentUser.get().getAuthResponse();
    return authResponse.access_token;
  } catch (error) {
    console.error('[GoogleAuthService] Erro ao obter token de acesso:', error);
    return null;
  }
};

// Criar um objeto nomeado para exportação
const googleAuthService = {
  initializeGoogleApi,
  signIn,
  signOut,
  isUserAuthenticated,
  hasRequiredScopes,
  getAccessToken
};

export default googleAuthService; 