import React, { useState, useEffect } from 'react';
import { signIn, signOut, isUserAuthenticated, initializeGoogleApi } from '../services/googleAuthService';

/**
 * Componente de autenticação com o Google
 * Exibe botões de login/logout e informações do usuário logado
 */
const GoogleAuth = ({ onAuthChange }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        await initializeGoogleApi();
        const authStatus = isUserAuthenticated();
        setIsSignedIn(authStatus);
        
        // Notifica componentes pai sobre mudança de estado
        if (onAuthChange) {
          onAuthChange(authStatus);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao inicializar autenticação Google:', error);
        setError('Falha ao conectar com serviços Google. Verifique sua conexão e tente novamente.');
        setIsLoading(false);
      }
    };

    initialize();
  }, [onAuthChange]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await signIn();
      setUserData(user);
      setIsSignedIn(true);
      
      if (onAuthChange) {
        onAuthChange(true);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Falha ao fazer login. ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setUserData(null);
      setIsSignedIn(false);
      
      if (onAuthChange) {
        onAuthChange(false);
      }
    } catch (error) {
      console.error('Erro no logout:', error);
      setError('Falha ao fazer logout. ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return (
      <div className="auth-error">
        <p>{error}</p>
        <button onClick={() => setError(null)}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="google-auth">
      {isSignedIn ? (
        <div className="user-profile">
          {userData && (
            <>
              <img 
                src={userData.imageUrl} 
                alt={userData.name} 
                className="user-avatar" 
              />
              <span className="user-name">{userData.name}</span>
            </>
          )}
          <button 
            onClick={handleSignOut}
            className="auth-button logout-button"
          >
            Sair
          </button>
        </div>
      ) : (
        <button 
          onClick={handleSignIn}
          className="auth-button login-button"
        >
          Login com Google
        </button>
      )}
    </div>
  );
};

export default GoogleAuth; 