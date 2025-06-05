import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CampaignProvider } from './contexts/CampaignContext';
import { AIContextProvider } from './contexts/AIContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Campaign from './components/Campaign';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import AIDemoPreview from './components/AIDemoPreview';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  setTimeout(() => {
    setIsLoading(false);
  }, 1500);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading">
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AIContextProvider>
          <CampaignProvider>
            <Router>
              <div className="app">
                <Navbar />
                <main className="landing">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/dashboard"
                      element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/campaign"
                      element={
                        <PrivateRoute>
                          <Campaign />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                </main>
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                />
              </div>
            </Router>
          </CampaignProvider>
        </AIContextProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 