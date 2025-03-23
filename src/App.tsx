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
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { getSpace } from "./services/db/spaces.service";
import { submitToAirtable } from "./services/airtable.service";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";
import { db } from "./services/firebase.service";
import { TrendingSpaces } from "./components/TrendingSpaces";
import { useWallet } from "./hooks/useWallet";
import ConnectButton from "./components/ConnectButton";
// import { WalletModal } from "./components/WalletModal";

export default function App() {
  const { isConnected, address, isConnecting, connectWallet, disconnect } =
    useWallet();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [spaceUrl, setSpaceUrl] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [spaces, loading, error] = useCollectionData(
    query(
      collection(db, "spaces"),
      where("transcription_status", "==", "ENDED"),
    ),
  );
  const [showWalletModal, setShowWalletModal] = useState(false);

  const transcribeSpace = async (spaceUrl: string) => {
    if (isLoading) return;
    setIsLoading(true);
    // x.com/i/spaces/1nAKEgjnRRkJL
    const spaceId = spaceUrl.split("/").pop();
    // Check if space already exists
    if (spaceId) {
      const space = await getSpace(spaceId);
      if (!space) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_JAM_SERVER_URL}/transcribe-recorded-space`,
            {
              spaceId,
            },
          );
          if (res.data.status === "success") {
            navigate(`/${spaceId}`);
          }
        } catch (error) {
          console.error(error);
          alert("Error transcribing the space, please try again later");
        }
      } else {
        navigate(`/${spaceId}`);
      }
    }
    setIsLoading(false);
  };

  const handleChainSelect = async (chain: "eth" | "base") => {
    setShowWalletModal(false);
    await connectWallet(chain);
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
          <span>Songjam</span>
        </div>
        <div className="nav-controls">
          <ConnectButton
            address={address}
            isConnected={isConnected}
            isConnecting={isConnecting}
            onConnect={() => connectWallet("eth")}
            onDisconnect={disconnect}
          />
        </div>
      </nav>

      {/* <WalletModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelectChain={handleChainSelect}
        isConnected={isConnected}
        onDisconnect={disconnect}
      /> */}

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
          <h1>Capture Every Conversation</h1>
          <div className="subtitle-wrapper">
            <p>
              Instantly convert X Spaces into shareable content with AI
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
                onClick={() => transcribeSpace(spaceUrl)}
              >
                Transcribe
              </LoadingButton>
            </Box>
          </div>
        </div>
        {spaces?.length && (
          <TrendingSpaces
            spaces={spaces.map((space) => ({
              spaceId: space.spaceId,
              title: space.title,
            }))}
            loading={loading}
          />
        )}
        <div className="cta-buttons">
          <Button
            variant="contained"
            className="primary"
            onClick={() => setShowConfirmation(true)}
          >
            Try For Free
          </Button>
          <Button variant="outlined" className="secondary" onClick={() => setShowConfirmation(true)}>
            View Pricing
          </Button>

          <Dialog
            open={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogContent sx={{ bgcolor: 'rgba(15, 23, 42, 0.95)', p: 0 }}>
              <IconButton
                onClick={() => setShowConfirmation(false)}
                sx={{ position: "absolute", right: 8, top: 8, color: 'var(--text-secondary)' }}
              >
                <CloseIcon />
              </IconButton>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h5" sx={{ mb: 2, background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  🎉 Special Launch Offer - Only $1 USDT! 🎉
                </Typography>
                <Typography sx={{ mb: 3, color: 'var(--text-secondary)' }}>
                  Get full access to our AI-powered transcription service for just $1 USDT. Try it now with zero risk - preview your transcription before paying!
                </Typography>
                <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(96, 165, 250, 0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#60a5fa' }}>
                    ✨ What You'll Get:
                  </Typography>
                  <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.9rem', mb: 1 }}>
                    • Full Space Transcription
                  </Typography>
                  <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.9rem', mb: 1 }}>
                    • AI-Powered Summary
                  </Typography>
                  <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    • Instant Content Generation
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  placeholder="Paste your X space URL here (e.g., x.com/i/spaces/123...)"
                  variant="outlined"
                  sx={{ mb: 3 }}
                  value={spaceUrl}
                  onChange={(e) => setSpaceUrl(e.target.value)}
                />
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    setShowConfirmation(false);
                    transcribeSpace(spaceUrl);
                  }}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(96, 165, 250, 0.4)',
                    }
                  }}
                >
                  Get Deal Now 🚀
                </LoadingButton>
                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'var(--text-secondary)' }}>
                  No commitment required - Preview before you pay!
                </Typography>
              </Box>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogContent sx={{ bgcolor: 'rgba(15, 23, 42, 0.95)', p: 0 }}>
              <IconButton
                onClick={() => setShowConfirmation(false)}
                sx={{ position: "absolute", right: 8, top: 8, color: 'var(--text-secondary)' }}
              >
                <CloseIcon />
              </IconButton>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Transform Your X Space into Content Gold ✨
                </Typography>
                <Typography sx={{ mb: 4, color: 'var(--text-secondary)' }}>
                  Paste your X Space URL below and watch the magic happen in seconds!
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Paste your X space URL here (e.g., x.com/i/spaces/123...)"
                  variant="outlined"
                  sx={{ mb: 3 }}
                  value={spaceUrl}
                  onChange={(e) => setSpaceUrl(e.target.value)}
                />
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  fullWidth
                  className="primary"
                  onClick={() => {
                    setShowConfirmation(false);
                    transcribeSpace(spaceUrl);
                  }}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(96, 165, 250, 0.4)',
                    }
                  }}
                >
                  Try It Now 🚀
                </LoadingButton>
                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'var(--text-secondary)' }}>
                  Join thousands of creators who trust SongJam for their content needs
                </Typography>
              </Box>
            </DialogContent>
          </Dialog>
        </div>
        <div className="trust-badges">
          <span>Powered by</span>
          <div className="badge">ElizaOS</div>
          <div className="badge">Ethereum</div>
          <div className="badge">Groq</div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">✍️</div>
          <h3>Transcribe</h3>
          <p>
            The days of manually taking notes for your Twitter space are over
          </p>
          <div className="feature-detail">Starting at $1/space</div>
        </div>
        <div className="feature">
          <div className="feature-icon">📋</div>
          <h3>Summarize</h3>
          <p>Generate awesome automated X space summaries in seconds</p>
          <div className="feature-detail">Get your time back</div>
        </div>
        <div className="feature">
          <div className="feature-icon">📣</div>
          <h3>Share</h3>
          <p>Create memorable threads and share with your audience</p>
          <div className="feature-detail">Customizable content</div>
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
          Songjam builders have won top awards from the following crypto
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
            <TextField
              fullWidth
              placeholder="Name"
              variant="outlined"
              name="name"
              required
              inputProps={{ minLength: 2 }}
            />
          </div>
          <div className="form-group">
            <TextField
              fullWidth
              placeholder="Telegram Username"
              variant="outlined"
              name="telegram"
              required
              inputProps={{ pattern: "@.*" }}
              helperText="Must start with @"
            />
          </div>
          <div className="form-group">
            <TextField
              fullWidth
              type="email"
              placeholder="Email"
              variant="outlined"
              name="email"
              required
            />
          </div>
          <div className="form-group">
            <TextareaAutosize
              placeholder="How can we help?"
              name="message"
              required
              minLength={10}
              style={{ width: "100%", minHeight: "100px" }}
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            className="primary"
            onClick={async (e) => {
              e.preventDefault();
              const form = e.currentTarget.closest("form");
              if (!form) return;

              if (!form.checkValidity()) {
                form.reportValidity();
                return;
              }

              const formData = new FormData(form);
              try {
                if (
                  !import.meta.env.VITE_AIRTABLE_API_KEY ||
                  !import.meta.env.VITE_AIRTABLE_BASE_ID ||
                  !import.meta.env.VITE_AIRTABLE_TABLE_NAME
                ) {
                  alert(
                    "Missing Airtable configuration. Please check your environment variables.",
                  );
                  return;
                }

                const result = await submitToAirtable({
                  name: formData.get("name") as string,
                  email: formData.get("email") as string,
                  telegram: formData.get("telegram") as string,
                  message: formData.get("message") as string,
                });

                if (result) {
                  alert("Form submitted successfully!");
                  form.reset();
                }
              } catch (error: any) {
                console.error("Submission error:", error);
                alert(
                  error?.message || "Error submitting form. Please try again.",
                );
              }
            }}
          >
            Submit
          </Button>
        </form>
      </section>

      <section className="social-media">
        <h2>Connect With Us</h2>
        <div className="social-links">
          <a
            href="https://www.producthunt.com/posts/songjam-otter-ai-for-x-spaces"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src="/logos/product-hunt.png" alt="Product Hunt" />
            <span>Product Hunt</span>
          </a>
          <a
            href="https://github.com/nusic-fm"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src="/logos/github.png" alt="GitHub" />
            <span>GitHub</span>
          </a>
          <a
            href="https://x.com/SongJamHQ"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src="/logos/twitter.png" alt="Twitter" />
            <span>Twitter</span>
          </a>
          <a
            href="https://www.linkedin.com/company/songjam/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src="/logos/linkedin.png" alt="LinkedIn" />
            <span>LinkedIn</span>
          </a>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; Songjam 2025. All rights reserved.</p>
      </footer>
    </main>
  );
}
