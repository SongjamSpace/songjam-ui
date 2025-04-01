import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SpaceDetails from './SpaceDetails';
import SpaceCRM from './SpaceCRM';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route
            path="/:spaceId"
            element={
              <AuthProvider>
                <SpaceDetails />
              </AuthProvider>
            }
          />
          <Route
            path="/crm/:spaceId"
            element={
              <AuthProvider>
                <SpaceCRM />
              </AuthProvider>
            }
          />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
