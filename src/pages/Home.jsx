import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">📄 DigiDoc</h1>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/features" className="nav-link">Features</Link>
          </div>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Receipt & Invoice Digitizer</h1>
          <p className="hero-subtitle">
            Transform your paper receipts and invoices into digital format instantly
          </p>
          <p className="hero-description">
            Streamline your document management with our powerful AI-driven digitization platform. 
            Upload, process, and organize your receipts and invoices with ease.
          </p>
          <Link to="/features" className="cta-button">
            Get Started →
          </Link>
        </div>

        <div className="features-preview">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Fast Processing</h3>
            <p>Upload and digitize documents in seconds</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>OCR Technology</h3>
            <p>Extract text and data with high accuracy</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Smart Analytics</h3>
            <p>Organize and analyze your financial documents</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Storage</h3>
            <p>Your data is encrypted and safely stored</p>
          </div>
        </div>

        <div className="how-it-works">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Documents</h3>
              <p>Drag and drop your receipts or invoices, or browse from your device</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Automatic Processing</h3>
              <p>Our AI scans and digitizes your documents instantly</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Extract Data</h3>
              <p>Get structured data with vendor info, amounts, dates, and more</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Export & Analyze</h3>
              <p>Export to CSV/JSON and integrate with your accounting systems</p>
            </div>
          </div>
        </div>

        <div className="benefits">
          <h2 className="section-title">Why Choose DigiDoc?</h2>
          <div className="benefits-grid">
            <div className="benefit">
              <span className="benefit-icon">⚡</span>
              <h3>Lightning Fast</h3>
              <p>Process hundreds of documents in minutes, not hours</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">💰</span>
              <h3>Cost Effective</h3>
              <p>Save time and money with automated data extraction</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🎯</span>
              <h3>High Accuracy</h3>
              <p>Advanced OCR technology ensures 99%+ accuracy</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">📱</span>
              <h3>Mobile Ready</h3>
              <p>Access from any device, anywhere, anytime</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🔄</span>
              <h3>Easy Integration</h3>
              <p>Export data in multiple formats for seamless workflow</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🛡️</span>
              <h3>Bank-Level Security</h3>
              <p>Enterprise-grade encryption keeps your data safe</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 DigiDoc. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Home
