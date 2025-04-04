import { useState, useEffect } from 'react';
import './App.css';
import Background from './components/Background';
import Logo from './components/Logo';
import {
  Button,
  TextField,
  TextareaAutosize,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { submitToAirtable } from './services/airtable.service';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from './services/firebase.service';
import { transcribeSpace } from './services/transcription.service';
import { toast } from 'react-hot-toast';

export default function App() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [spaceUrl, setSpaceUrl] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [spaces, loading, error] = useCollectionData(
    query(
      collection(db, 'spaces'),
      where('transcription_status', '==', 'ENDED'),
      orderBy('createdAt', 'desc')
    )
  );

  const handleAnalyze = async (url: string) => {
    if (isLoading || !url.trim()) return;
    setIsLoading(true);
    const spaceId = url.split('/').pop();
    const res = await axios.get(
      `${import.meta.env.VITE_JAM_SERVER_URL}/get-space/${spaceId}`
    );
    if (res.data.result) {
      const state = res.data.result.metadata.state;
      if (state === 'Ended') {
        const path = await transcribeSpace(url);
        navigate(path);
      } else if (state === 'Running') {
        const res = await axios.post(
          `${import.meta.env.VITE_JAM_SERVER_URL}/listen-live-space`,
          { spaceId }
        );
        navigate(`/live/${spaceId}`);
      }
    } else {
      toast.error('Error analyzing space, please try again', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: '#333',
          color: '#fff',
        },
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    document.body.className = 'dark';
  }, []);

  return (
    <main className="landing">
      <Background />
      <nav>
        <div className="logo">
          <Logo />
          <span>Songjam</span>
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
          <h1>
            Unlock Insights<br></br>Amplify Voices
          </h1>
          <div className="subtitle-wrapper">
            <p>
              X Spaces Text-to-Speech and AI Analysis<br></br>Capture Every
              Conversation
            </p>
            <Box className="space-input" display="flex" gap={2}>
              <TextField
                fullWidth
                placeholder="Paste your X space URL here to try it now"
                onChange={(e) => setSpaceUrl(e.target.value)}
                variant="outlined"
              />
              <LoadingButton
                loading={isLoading}
                variant="contained"
                className="primary"
                onClick={() => handleAnalyze(spaceUrl)}
              >
                Analyze
              </LoadingButton>
            </Box>
          </div>
        </div>
        <div className="cta-buttons">
          <Button
            variant="contained"
            className="primary"
            onClick={() => setIsPreviewDialogOpen(true)}
          >
            Try Preview
          </Button>
          <Button
            variant="outlined"
            className="secondary"
            onClick={() => setShowConfirmation(true)}
          >
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
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'var(--text-secondary)',
                }}
              >
                <CloseIcon />
              </IconButton>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    background:
                      'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  🎉 Special Launch Offer - Only $1 USDT! 🎉
                </Typography>
                <Typography sx={{ mb: 3, color: 'var(--text-secondary)' }}>
                  Get full access to our AI-powered transcription service for
                  just $1 USDT. Try it now with zero risk - preview the timeline
                  before paying!
                </Typography>
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: 'rgba(96, 165, 250, 0.1)',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: '#60a5fa' }}
                  >
                    ✨ What You'll Get:
                  </Typography>
                  <Typography
                    sx={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      mb: 1,
                    }}
                  >
                    • 1 x Full Space Transcription
                  </Typography>
                  <Typography
                    sx={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      mb: 1,
                    }}
                  >
                    • 1 x AI-Powered Summary
                  </Typography>
                  <Typography
                    sx={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    • Full Thread with 3 x Remixes
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
                    handleAnalyze(spaceUrl);
                  }}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    background:
                      'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(96, 165, 250, 0.4)',
                    },
                  }}
                >
                  Get Deal Now 🚀
                </LoadingButton>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 2,
                    color: 'var(--text-secondary)',
                  }}
                >
                  No commitment required - Preview before you pay!
                </Typography>
              </Box>
            </DialogContent>
          </Dialog>

          {/* New Preview Spaces Dialog - Enhanced Styling v2 */}
          <Dialog
            open={isPreviewDialogOpen}
            onClose={() => setIsPreviewDialogOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { bgcolor: 'rgba(15, 23, 42, 0.95)' } }} // Apply background to Paper
          >
            {/* No DialogTitle needed, handled in content */}
            <DialogContent sx={{ p: 0, border: 'none' }}>
              <IconButton
                aria-label="close"
                onClick={() => setIsPreviewDialogOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'var(--text-secondary)',
                  zIndex: 1, // Ensure it's above content
                }}
              >
                <CloseIcon />
              </IconButton>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    background:
                      'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  🔭 Preview Analyzed Spaces 🔭
                </Typography>
                <Typography sx={{ mb: 3, color: 'var(--text-secondary)' }}>
                  Click on any space below to see an example of the analysis
                  output. Paste your own space URL on the homepage to try it!
                </Typography>
                {/* Styled Box for List Content */}
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: 'rgba(96, 165, 250, 0.1)', // Match highlight box bg
                    borderRadius: 2,
                    textAlign: 'left', // Align content left within this box
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: '#60a5fa' }} // Match highlight title
                  >
                    🚀 Available Previews:
                  </Typography>

                  {/* Conditional Rendering Inside Styled Box */}
                  {loading && (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', my: 3 }}
                    >
                      <CircularProgress color="inherit" /> {/* Inherit color */}
                    </Box>
                  )}
                  {error && (
                    <Typography color="error" sx={{ my: 3 }}>
                      Error loading spaces: {error.message}
                    </Typography>
                  )}
                  {!loading && !error && spaces && spaces.length > 0 && (
                    <List sx={{ maxHeight: 300, overflow: 'auto', p: 0 }}>
                      {spaces.map((space: any) => (
                        <ListItemButton
                          key={space.spaceId}
                          onClick={() => {
                            setIsPreviewDialogOpen(false);
                            navigate(`/crm/${space.spaceId}`);
                          }}
                          sx={{
                            mb: 1,
                            borderRadius: 1,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                        >
                          <ListItemText
                            primary={space.title || `Space ${space.spaceId}`}
                            secondary={`Analyzed on: ${
                              space.createdAt?.toDate
                                ? space.createdAt.toDate().toLocaleDateString()
                                : 'N/A'
                            }`}
                            primaryTypographyProps={{
                              color: 'var(--text-primary)',
                            }}
                            secondaryTypographyProps={{
                              color: 'var(--text-secondary)',
                              fontSize: '0.8rem',
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                  {!loading && !error && (!spaces || spaces.length === 0) && (
                    <Typography
                      sx={{
                        my: 3,
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      No completed spaces available for preview yet.
                    </Typography>
                  )}
                </Box>{' '}
                {/* End Styled Box for List Content */}
                <Typography
                  sx={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                  }}
                >
                  This is just a preview. Analyze your own space for full
                  insights!
                </Typography>
              </Box>{' '}
              {/* End Inner Padding Box */}
            </DialogContent>
            {/* No DialogActions needed */}
          </Dialog>
        </div>
        <div className="trust-badges">
          <span>Powered by</span>
          <div className="badge">ElizaOS</div>
          <div className="badge">Ethereum</div>
          <div className="badge">Grok</div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">✍️</div>
          <h3>Transcribe</h3>
          <p>
            Converting your X Space audio into text makes it easy to analyze
          </p>
          <div className="feature-detail">Get your time back</div>
        </div>
        <div className="feature">
          <div className="feature-icon">📋</div>
          <h3>Analyze</h3>
          <p>Unlock awesome insights from your X Spaces in seconds</p>
          <div className="feature-detail">Harness the power of AI</div>
        </div>
        <div className="feature">
          <div className="feature-icon">📣</div>
          <h3>Share</h3>
          <p>Compilie your insights and share with your audience</p>
          <div className="feature-detail">Infinitely customizable</div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Connect Space</h4>
            <p>Paste the URL of your live X Space</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Retrieve Listeners</h4>
            <p>All listener X accounts will be retrieved</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Dive In</h4>
            <p>Leverage LLMs to analyze the space</p>
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
              inputProps={{ pattern: '@.*' }}
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
              style={{ width: '100%', minHeight: '100px' }}
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            className="primary"
            onClick={async (e) => {
              e.preventDefault();
              const form = e.currentTarget.closest('form');
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
                    'Missing Airtable configuration. Please check your environment variables.'
                  );
                  return;
                }

                const result = await submitToAirtable({
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  telegram: formData.get('telegram') as string,
                  message: formData.get('message') as string,
                });

                if (result) {
                  alert('Form submitted successfully!');
                  form.reset();
                }
              } catch (error: any) {
                console.error('Submission error:', error);
                alert(
                  error?.message || 'Error submitting form. Please try again.'
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
        <Box display="flex" flexWrap="wrap" gap={8} justifyContent="center">
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
            href="https://x.com/SongjamSpace"
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
        </Box>
      </section>

      <footer className="footer">
        <p>&copy; Songjam 2025. All rights reserved.</p>
      </footer>
    </main>
  );
}
