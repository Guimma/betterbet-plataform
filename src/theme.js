import { extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  cssVarPrefix: 'betterbet',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#e5eaf1',
          100: '#c1ccdc',
          200: '#9babc5',
          300: '#738aad',
          400: '#5673a1',
          500: '#2767e2',
          600: '#255bcf',
          700: '#204fb6',
          800: '#0c2544',
          900: '#081a33',
          solidBg: '#2767e2',
          solidHoverBg: '#255bcf',
          solidActiveBg: '#204fb6',
        },
        accent: '#ff0000',
        success: {
          solidBg: '#27ae60',
          solidHoverBg: '#219652',
        },
        warning: {
          solidBg: '#f39c12',
          solidHoverBg: '#d88c11',
        },
        danger: {
          solidBg: '#ff0000',
          solidHoverBg: '#e50000',
        },
        neutral: {
          outlinedBg: '#f5f7fa',
          outlinedHoverBg: '#e9ecef',
        },
        background: {
          body: '#f5f7fa',
          surface: '#ffffff',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          50: '#0a1c33',
          100: '#0f2747',
          200: '#16325b',
          300: '#1c3d70',
          400: '#234a85',
          500: '#2767e2',
          600: '#4178e5',
          700: '#5b89e8',
          800: '#769aec',
          900: '#90abef',
          solidBg: '#2767e2',
          solidHoverBg: '#4178e5',
          solidActiveBg: '#5b89e8',
        },
        accent: '#ff3333',
        success: {
          solidBg: '#2ecc71',
          solidHoverBg: '#27ae60',
        },
        warning: {
          solidBg: '#f1c40f',
          solidHoverBg: '#f39c12',
        },
        danger: {
          solidBg: '#ff3333',
          solidHoverBg: '#e50000',
        },
        neutral: {
          outlinedBg: '#1a2334',
          outlinedHoverBg: '#263450',
          solidBg: '#1a2334',
          solidHoverBg: '#263450',
        },
        background: {
          body: '#0c1c32',
          surface: '#13243d',
          level1: '#1a2c4a',
          level2: '#213656',
          level3: '#2a4166',
        },
        text: {
          primary: '#ffffff',
          secondary: '#c8d6e5',
          tertiary: '#8395b5',
        },
        divider: 'rgba(255, 255, 255, 0.15)',
      },
    },
  },
  fontFamily: {
    body: "'Roboto', sans-serif",
    display: "'Roboto', sans-serif",
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          borderRadius: '8px',
          fontWeight: 500,
          ...(ownerState.size === 'md' && {
            paddingBlock: '10px',
            paddingInline: '16px',
          }),
        }),
      },
    },
    JoyCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        },
      },
    },
    JoyInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    JoyTable: {
      styleOverrides: {
        root: {
          '& th': {
            fontWeight: 600,
          },
        },
      },
    },
  },
});

export default theme; 