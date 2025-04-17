import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa', // Updated to match --accent
    },
    info: {
      main: '#8973F8', // Updated to match --accent
    },
    secondary: {
      main: '#ffffff', // Updated to match --text-secondary
    },
    background: {
      default: '#0f172a', // Updated to match --bg-primary
      paper: '#1e293b', // Updated to match --bg-secondary
    },
    text: {
      primary: '#f1f5f9', // Updated to match --text-primary
      secondary: '#94a3b8', // Updated to match --text-secondary
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    allVariants: {
      color: 'white',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px', // Updated to match your CSS
          textTransform: 'none',
          color: 'white',
          // fontWeight: 500,
          // padding: '0.8rem 1.5rem', // Updated to match your CSS
        },
        contained: {
          boxShadow: 'none',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)`,
        },
        // outlinedPrimary: {
        //   borderColor: '#8b5cf6',
        // },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
        },
      },
    },
  },
});

export default theme;
