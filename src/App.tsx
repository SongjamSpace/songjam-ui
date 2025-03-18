import { useState, useEffect } from "react";
import "./App.css";
import Background from "./components/Background";
import Logo from "./components/Logo";

export default function App() {
  const [connectWallet, setConnectWallet] = useState(false);
  const [spaceUrl, setSpaceUrl] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

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
          <button
            onClick={() => setConnectWallet(true)}
            className="connect-wallet"
          >
            {connectWallet ? "Connected" : "Connect Wallet"}
          </button>
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
            <div className="space-input">
              <input
                type="text"
                placeholder="Paste your X space URL here to try it now"
                onChange={(e) => setSpaceUrl(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="cta-buttons">
          <button className="primary" onClick={() => setShowConfirmation(true)}>
            Start Free Trial
          </button>
          <button className="secondary">View Pricing</button>
          {showConfirmation && (
            <div className="confirmation-overlay">
              <div className="confirmation-dialog">
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
                <button
                  className="close-button"
                  onClick={() => setShowConfirmation(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
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
              src="/logos/polkadot.png"
              alt="Polkadot"
              className="honor-logo"
            />
            <span>Polkadot</span>
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
        </div>
      </section>

      <section className="contact">
        <h2>Contact Us</h2>
        <p>Got a beefy project or custom request? Drop us a line</p>
        <form className="contact-form">
          <div className="form-group">
            <input type="text" placeholder="Name" />
          </div>
          <div className="form-group phone-input">
            <select className="country-select">
              <option value="+93">🇦🇫 +93</option>
              <option value="+355">🇦🇱 +355</option>
              <option value="+213">🇩🇿 +213</option>
              <option value="+376">🇦🇩 +376</option>
              <option value="+244">🇦🇴 +244</option>
              <option value="+54">🇦🇷 +54</option>
              <option value="+374">🇦🇲 +374</option>
              <option value="+61">🇦🇺 +61</option>
              <option value="+43">🇦🇹 +43</option>
              <option value="+994">🇦🇿 +994</option>
              <option value="+973">🇧🇭 +973</option>
              <option value="+880">🇧🇩 +880</option>
              <option value="+32">🇧🇪 +32</option>
              <option value="+55">🇧🇷 +55</option>
              <option value="+359">🇧🇬 +359</option>
              <option value="+1">🇨🇦 +1</option>
              <option value="+86">🇨🇳 +86</option>
              <option value="+45">🇩🇰 +45</option>
              <option value="+20">🇪🇬 +20</option>
              <option value="+358">🇫🇮 +358</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+49">🇩🇪 +49</option>
              <option value="+30">🇬🇷 +30</option>
              <option value="+852">🇭🇰 +852</option>
              <option value="+36">🇭🇺 +36</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+62">🇮🇩 +62</option>
              <option value="+98">🇮🇷 +98</option>
              <option value="+353">🇮🇪 +353</option>
              <option value="+972">🇮🇱 +972</option>
              <option value="+39">🇮🇹 +39</option>
              <option value="+81">🇯🇵 +81</option>
              <option value="+962">🇯🇴 +962</option>
              <option value="+254">🇰🇪 +254</option>
              <option value="+82">🇰🇷 +82</option>
              <option value="+965">🇰🇼 +965</option>
              <option value="+60">🇲🇾 +60</option>
              <option value="+52">🇲🇽 +52</option>
              <option value="+377">🇲🇨 +377</option>
              <option value="+31">🇳🇱 +31</option>
              <option value="+64">🇳🇿 +64</option>
              <option value="+47">🇳🇴 +47</option>
              <option value="+92">🇵🇰 +92</option>
              <option value="+51">🇵🇪 +51</option>
              <option value="+63">🇵🇭 +63</option>
              <option value="+48">🇵🇱 +48</option>
              <option value="+351">🇵🇹 +351</option>
              <option value="+974">🇶🇦 +974</option>
              <option value="+40">🇷🇴 +40</option>
              <option value="+7">🇷🇺 +7</option>
              <option value="+966">🇸🇦 +966</option>
              <option value="+65">🇸🇬 +65</option>
              <option value="+27">🇿🇦 +27</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+46">🇸🇪 +46</option>
              <option value="+41">🇨🇭 +41</option>
              <option value="+886">🇹🇼 +886</option>
              <option value="+66">🇹🇭 +66</option>
              <option value="+90">🇹🇷 +90</option>
              <option value="+971">🇦🇪 +971</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+84">🇻🇳 +84</option>
            </select>
            <input type="tel" placeholder="Phone Number" />
          </div>
          <div className="form-group">
            <input type="email" placeholder="Email" />
          </div>
          <div className="form-group">
            <textarea placeholder="How can we help?" rows={4}></textarea>
          </div>
          <button type="submit" className="primary">Submit</button>
        </form>
      </section>

      <footer className="footer">
        <p>&copy; SongJam 2025. All rights reserved.</p>
      </footer>
    </main>
  );
}
