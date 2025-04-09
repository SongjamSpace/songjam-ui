import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SpaceDetails from './SpaceDetails';
import SpaceCRM from './SpaceCRM';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import LiveDashboardContainer from './components/LiveDashboard/LiveDashboardContainer';
import Dashboard from './components/Dashboard';
import './i18n';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<App />} />
              {/* <Route
                path="/:spaceId"
                element={
                  <AuthProvider>
                    <SpaceDetails />
                  </AuthProvider>
                }
              /> */}
              <Route
                path="/crm/:spaceId"
                element={<SpaceCRM />}
              />
              <Route
                path="/live/:spaceId"
                element={<LiveDashboardContainer />}
              />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
