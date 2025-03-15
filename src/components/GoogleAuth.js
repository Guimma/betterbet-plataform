import React, { useState, useEffect } from 'react';
import { signIn, signOut, isUserAuthenticated, initializeGoogleApi } from '../services/googleAuthService';
import Button from '@mui/joy/Button';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import Avatar from '@mui/joy/Avatar';
import IconButton from '@mui/joy/IconButton';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import Alert from '@mui/joy/Alert';
import ReportIcon from '@mui/icons-material/Report';

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
    return <CircularProgress size="sm" />;
  }

  if (error) {
    return (
      <Alert
        variant="soft" 
        color="danger"
        size="sm"
        startDecorator={<ReportIcon />}
        endDecorator={
          <Button 
            size="sm" 
            variant="soft" 
            color="danger" 
            onClick={() => setError(null)}
          >
            Tentar novamente
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {isSignedIn ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {userData && (
            <>
              <Avatar 
                src={userData.imageUrl} 
                alt={userData.name}
                size="sm"
              />
              <Typography level="body-sm" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {userData.name}
              </Typography>
              <IconButton
                variant="soft"
                color="neutral"
                size="sm"
                onClick={handleSignOut}
                title="Sair"
              >
                <LogoutRounded fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      ) : (
        <Button 
          onClick={handleSignIn}
          variant="solid"
          color="primary"
          size="sm"
        >
          Login com Google
        </Button>
      )}
    </Box>
  );
};

export default GoogleAuth; 