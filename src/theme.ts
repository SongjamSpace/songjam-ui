import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#60a5fa", // Updated to match --accent
    },
    secondary: {
      main: "#94a3b8", // Updated to match --text-secondary
    },
    background: {
      default: "#0f172a", // Updated to match --bg-primary
      paper: "#1e293b", // Updated to match --bg-secondary
    },
    text: {
      primary: "#f1f5f9", // Updated to match --text-primary
      secondary: "#94a3b8", // Updated to match --text-secondary
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    allVariants: {
      color: "white",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "6px", // Updated to match your CSS
          textTransform: "none",
          fontWeight: 500,
          padding: "0.8rem 1.5rem", // Updated to match your CSS
        },
        contained: {
          background: `linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)`, // Added gradient from CSS
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 5px 15px rgba(96, 165, 250, 0.4)", // Added from your CSS
            transform: "translateY(-2px)", // Added from your CSS
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "12px",
        },
      },
    },
  },
});

export default theme;
