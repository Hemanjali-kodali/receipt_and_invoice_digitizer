import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import "../../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await api.login({ email, password });

      if (res.access_token) {
        localStorage.setItem("token", res.access_token);
        navigate("/dashboard");
      } else {
        setErrorMessage(res.detail || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="auth-container fade-in">

        {/* LEFT SIDE */}
        <div className="visual-section">
          <div className="visual-card">
            <div className="scanner-circle">
              <div className="scan-line"></div>
              <div className="receipt-icon">🧾</div>
            </div>

            <h2 className="visual-title">DocuScan</h2>

            <p className="visual-quote">
              Turn paper receipts into searchable digital records.
            </p>

            <ul className="feature-list">
              <li>✔ Auto-scan receipts</li>
              <li>✔ Extract totals & dates</li>
              <li>✔ Export to CSV / PDF</li>
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-section">
          <h2>Welcome Back 👋</h2>
          <p className="subtitle">Please login to continue</p>

          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>

            <button
              type="submit"
              className="google-btn primary"
              disabled={loading}
            >
              {loading ? <div className="spinner"></div> : "Login"}
            </button>
          </form>

          {errorMessage && (
            <p className="error-text">{errorMessage}</p>
          )}

          <div className="divider">Don't have an account?</div>

          <button
            className="google-btn secondary"
            onClick={() => navigate("/register")}
          >
            Create Account
          </button>

          <p className="footer-text">
            Secure login powered by FastAPI backend
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;