import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AIDemoPreview from './AIDemoPreview';

function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1 className="gradient-text">
          Transform Your Music Marketing with AI
        </h1>
        <p className="hero-subtitle">
          Create personalized campaigns that connect with your audience on a deeper level
        </p>
        <div className="cta-buttons">
          {!currentUser ? (
            <>
              <Link to="/register" className="cta-button primary pulse">
                Get Started
              </Link>
              <Link to="/login" className="cta-button secondary">
                Sign In
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="cta-button primary pulse">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card glass float">
          <div className="feature-icon">🎯</div>
          <h3>Smart Targeting</h3>
          <p>Reach the right audience with AI-powered targeting</p>
        </div>
        <div className="feature-card glass float" style={{ animationDelay: '0.2s' }}>
          <div className="feature-icon">🤖</div>
          <h3>AI Assistant</h3>
          <p>Get personalized recommendations and insights</p>
        </div>
        <div className="feature-card glass float" style={{ animationDelay: '0.4s' }}>
          <div className="feature-icon">📊</div>
          <h3>Analytics</h3>
          <p>Track and optimize your campaign performance</p>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="gradient-text">See AI in Action</h2>
        <div className="demo-container glass">
          <AIDemoPreview />
        </div>
      </div>

      <div className="testimonials-section">
        <h2 className="gradient-text">What Artists Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card glass">
            <p>"This platform has completely transformed how I connect with my fans."</p>
            <div className="testimonial-author">- Sarah J.</div>
          </div>
          <div className="testimonial-card glass">
            <p>"The AI suggestions are spot-on. My engagement has doubled!"</p>
            <div className="testimonial-author">- Mike R.</div>
          </div>
          <div className="testimonial-card glass">
            <p>"Finally, a tool that understands the music industry."</p>
            <div className="testimonial-author">- Alex K.</div>
          </div>
        </div>
      </div>

      <div className="pricing-section">
        <h2 className="gradient-text">Simple, Transparent Pricing</h2>
        <div className="pricing-grid">
          <div className="pricing-card glass">
            <h3>Starter</h3>
            <div className="price">$29<span>/month</span></div>
            <ul>
              <li>Basic AI Features</li>
              <li>Up to 1,000 messages</li>
              <li>Basic Analytics</li>
            </ul>
            <Link to="/register" className="cta-button secondary">
              Start Free Trial
            </Link>
          </div>
          <div className="pricing-card glass pulse">
            <div className="popular-tag">Most Popular</div>
            <h3>Pro</h3>
            <div className="price">$79<span>/month</span></div>
            <ul>
              <li>Advanced AI Features</li>
              <li>Up to 5,000 messages</li>
              <li>Advanced Analytics</li>
              <li>Priority Support</li>
            </ul>
            <Link to="/register" className="cta-button primary">
              Start Free Trial
            </Link>
          </div>
          <div className="pricing-card glass">
            <h3>Enterprise</h3>
            <div className="price">Custom</div>
            <ul>
              <li>Custom AI Solutions</li>
              <li>Unlimited Messages</li>
              <li>Custom Analytics</li>
              <li>Dedicated Support</li>
            </ul>
            <Link to="/register" className="cta-button secondary">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      <footer className="footer glass">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/demo">Demo</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/careers">Careers</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 SongJam. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing; 