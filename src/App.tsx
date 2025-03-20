import { useState, useEffect } from "react";
import "./App.css";
import Background from "./components/Background";
import Logo from "./components/Logo";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  TextareaAutosize,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";

export default function App() {
  const [connectWallet, setConnectWallet] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const [spaceUrl, setSpaceUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const joinSpace = async (spaceUrl: string) => {
    if (isLoading) return;
    setIsLoading(true);
    // x.com/i/spaces/1nAKEgjnRRkJL
    const spaceId = spaceUrl.split("/").pop();
    const res = await axios.post(
      `${import.meta.env.VITE_JAM_SERVER_URL}/join-space`,
      {
        spaceId,
      },
    );
    if (res.data.status === "success") {
      navigate(`/${spaceId}`);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    document.body.className = "dark";
  }, []);

  return (
    <main className="landing">
      <Background />
      <nav>
        <div className="logo">
          <Logo />
          <span>SongJam</span>
        </div>
        <div className="nav-controls">
          <Button
            variant="contained"
            onClick={() => setConnectWallet(true)}
            className="connect-wallet"
          >
            {connectWallet ? "Connected" : "Connect Wallet"}
          </Button>
        </div>
      </nav>

      <section className="hero">
        <div className="stats-banner">
          <div className="stat">
            <span className="stat-number">99%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat">
            <span className="stat-number">X</span>
            <span className="stat-label">Spaces Native</span>
          </div>
          <div className="stat">
            <span className="stat-number">USDT</span>
            <span className="stat-label">Settlement</span>
          </div>
        </div>
        <div className="animated-title">
          <h1>X Spaces Transcription</h1>
          <div className="subtitle-wrapper">
            <p>
              Instantly convert Twitter Spaces content into text with AI
              precision
            </p>
            <Box className="space-input" display="flex" gap={2}>
              <TextField
                fullWidth
                placeholder="Paste your X space URL here to try it now"
                onChange={(e) => {
                  if (isLoading) return;
                  setSpaceUrl(e.target.value);
                }}
                variant="outlined"
              />
              <LoadingButton
                loading={isLoading}
                variant="contained"
                className="primary"
                onClick={() => joinSpace(spaceUrl)}
              >
                Transcribe
              </LoadingButton>
            </Box>
          </div>
        </div>
        <div className="cta-buttons">
          <Button
            variant="contained"
            className="primary"
            onClick={() => setShowConfirmation(true)}
          >
            Start Free Trial
          </Button>
          <Button variant="outlined" className="secondary">
            View Pricing
          </Button>

          <Dialog
            open={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogContent>
              <IconButton
                onClick={() => setShowConfirmation(false)}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
              <p className="instruction">
                Please accept SongJam as a speaker to begin recording
              </p>
              <div className="space-preview">
                <div className="space-header">
                  <div className="space-info">
                    <span className="live-indicator">LIVE</span>
                    <h3>Your Space</h3>
                  </div>
                  <div className="space-stats">
                    <span>🎯 2.1K listening</span>
                  </div>
                </div>
                <div className="speaker-request">
                  <div className="agent-profile">
                    <div className="agent-avatar">🤖</div>
                    <div className="agent-info">
                      <h4>SongJam_agent</h4>
                      <p>Requesting to join as speaker</p>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button
                      className="accept"
                      onClick={() => setShowConfirmation(false)}
                    >
                      Accept
                    </button>
                    <button
                      className="deny"
                      onClick={() => setShowConfirmation(false)}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowConfirmation(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </div>
        <div className="trust-badges">
          <span>Powered by</span>
          <div className="badge">Base</div>
          <div className="badge">ElizaOS</div>
          <div className="badge">Groq</div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">💰</div>
          <h3>Pay Per Use</h3>
          <p>Only pay for what you need with our flexible USDT-based pricing</p>
          <div className="feature-detail">Starting at $0.01/minute</div>
        </div>
        <div className="feature">
          <div className="feature-icon">🎁</div>
          <h3>Free Trial</h3>
          <p>Test our service with 30 minutes of free transcription</p>
          <div className="feature-detail">No credit card required</div>
        </div>
        <div className="feature">
          <div className="feature-icon">🔒</div>
          <h3>Secure</h3>
          <p>Enterprise-grade security with smart contract payments</p>
          <div className="feature-detail">Audited by Certik</div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Connect Wallet</h4>
            <p>Link your Web3 wallet</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Deposit USDT</h4>
            <p>Fund your account</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Start Transcribing</h4>
            <p>Deploy in any Space</p>
          </div>
        </div>
      </section>

      <section className="honors">
        <h2>Honors</h2>
        <p>
          SongJam builders have won top awards from the following crypto
          leaders:
        </p>
        <div className="honors-grid">
          <div className="honor-item">
            <img
              src="/logos/chainlink.png"
              alt="Chainlink"
              className="honor-logo"
            />
            <span>Chainlink</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/coinbase.png"
              alt="Coinbase"
              className="honor-logo"
            />
            <span>Coinbase</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/coindesk.png"
              alt="Coindesk"
              className="honor-logo"
            />
            <span>Coindesk</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/filecoin.png"
              alt="Filecoin"
              className="honor-logo"
            />
            <span>Filecoin</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/moonbeam.png"
              alt="Moonbeam"
              className="honor-logo"
            />
            <span>Moonbeam</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/nethermind.png"
              alt="Nethermind"
              className="honor-logo"
            />
            <span>Nethermind</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/oniforce.png"
              alt="ONI Force"
              className="honor-logo"
            />
            <span>ONI Force</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/polkadot.png"
              alt="Polkadot"
              className="honor-logo"
            />
            <span>Polkadot</span>
          </div>
        </div>
      </section>

      <section className="contact">
        <h2>Contact Us</h2>
        <p>Got a beefy project or custom request? Drop us a line</p>
        <form className="contact-form">
          <div className="form-group">
            <TextField fullWidth placeholder="Name" variant="outlined" />
          </div>
          <Box
            className="form-group phone-input"
            display="flex"
            gap={2}
            alignItems={"center"}
          >
            <FormControl className="country-select">
              <Select defaultValue="+1">
                <MenuItem value="+1">🇺🇸 +1</MenuItem>
                <MenuItem value="+44">🇬🇧 +44</MenuItem>
                <MenuItem value="+91">🇮🇳 +91</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="tel"
              placeholder="Phone Number"
              variant="outlined"
            />
          </Box>
          <div className="form-group">
            <TextField
              fullWidth
              type="email"
              placeholder="Email"
              variant="outlined"
            />
          </div>
          <div className="form-group">
            <TextareaAutosize placeholder="How can we help?" />
          </div>
          <Button type="submit" variant="contained" className="primary">
            Submit
          </Button>
        </form>
      </section>

      <section className="social-media">
        <h2>Connect With Us</h2>
        <div className="social-links">
          <a href="https://www.producthunt.com" target="_blank" rel="noopener noreferrer" className="social-link">
            <img src="/logos/product-hunt.png" alt="Product Hunt" />
            <span>Product Hunt</span>
          </a>
          <a href="https://github.com/nusic-fm" target="_blank" rel="noopener noreferrer" className="social-link">
            <img src="/logos/github.png" alt="GitHub" />
            <span>GitHub</span>
          </a>
          <a href="https://x.com/SongJamHQ" target="_blank" rel="noopener noreferrer" className="social-link">
            <img src="/logos/twitter.png" alt="Twitter" />
            <span>Twitter</span>
          </a>
          <a href="https://www.linkedin.com/company/songjam/" target="_blank" rel="noopener noreferrer" className="social-link">
            <img src="/logos/linkedin.png" alt="LinkedIn" />
            <span>LinkedIn</span>
          </a>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; SongJam 2025. All rights reserved.</p>
      </footer>
    </main>
  );
}
