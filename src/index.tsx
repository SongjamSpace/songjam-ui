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
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import Settings from './pages/Settings';
import CampaignDetails from './pages/CampaignDetails';
import MusicAgent from './pages/MusicAgent';
import Leaderboard from './pages/Leaderboard';
import WebFont from 'webfontloader';
import Flag from './pages/Flag';
import SignPointsLeaderboard from './components/SignPointsLeaderboard';
import MapView from './pages/MapView';
import Admin from './pages/Admin';
import Dj from './pages/Dj';
import AutoDms from './pages/AutoDms';
import CreateDb from './pages/CreateDb';
import { base, mainnet } from 'viem/chains';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

WebFont.load({
  google: {
    families: ['Audiowide:400,500,600,700&display=swap', 'Orbitron'],
  },
});

const wagmiConfig = getDefaultConfig({
  appName: 'Songjam',
  projectId: '17f62a879ac6b14cafeb5315246fa81a',
  chains: [mainnet, base],
  ssr: false, // If your dApp uses server side rendering (SSR)
});
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <DynamicContextProvider
          settings={{
            environmentId: import.meta.env.VITE_DYNAMIC_ENV_ID,
            walletConnectors: [EthereumWalletConnectors],
            initialAuthenticationMode: 'connect-only',
          }}
        >
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider modalSize="compact">
                <ThemeProvider theme={theme}>
                  <AuthProvider>
                    <Routes>
                      <Route path="/" element={<Leaderboard />} />
                      <Route path="/spaces-crm" element={<App />} />
                      <Route
                        path="/auto-dms/:campaignId?"
                        element={<AutoDms />}
                      />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/crm/:spaceId" element={<SpaceCRM />} />
                      <Route
                        path="/live/:spaceId"
                        element={<LiveDashboardContainer />}
                      />
                      <Route path="/settings" element={<Settings />} />
                      <Route
                        path="/campaigns/:id"
                        element={<CampaignDetails />}
                      />
                      <Route path="/dj" element={<MusicAgent />} />
                      <Route path="/live-dj" element={<Dj />} />
                      <Route
                        path="/leaderboard"
                        element={<SignPointsLeaderboard />}
                      />
                      <Route path="/flags" element={<Flag />} />
                      <Route path="/map" element={<MapView />} />
                      <Route path="/admin-test" element={<Admin />} />
                      <Route path="/create-db" element={<CreateDb />} />
                    </Routes>
                  </AuthProvider>
                </ThemeProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </DynamicContextProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
