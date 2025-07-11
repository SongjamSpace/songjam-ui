import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SpaceCRM from './SpaceCRM';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import LiveDashboardContainer from './components/LiveDashboard/LiveDashboardContainer';
import './i18n';
import Dashboard from './components/Dashboard';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
// import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import Settings from './pages/Settings';
import CampaignDetails from './pages/CampaignDetails';
import MusicAgent from './pages/MusicAgent';
import Leaderboard from './pages/Leaderboard';
import WebFont from 'webfontloader';
import Flag from './pages/Flag';

WebFont.load({
  google: {
    families: ['Chakra Petch:400,700&display=swap'],
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <DynamicContextProvider
          settings={{
            environmentId: import.meta.env.VITE_DYNAMIC_ENV_ID,
            // walletConnectors: [EthereumWalletConnectors],
          }}
        >
          <ThemeProvider theme={theme}>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Leaderboard />} />
                <Route path="/spaces-crm" element={<App />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/crm/:spaceId" element={<SpaceCRM />} />
                <Route
                  path="/live/:spaceId"
                  element={<LiveDashboardContainer />}
                />
                <Route path="/settings" element={<Settings />} />
                <Route path="/campaigns/:id" element={<CampaignDetails />} />
                <Route path="/dj" element={<MusicAgent />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/flags" element={<Flag />} />
              </Routes>
            </AuthProvider>
          </ThemeProvider>
        </DynamicContextProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
