import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import "../../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await api.login({ email, password });

      if (res.access_token) {
        localStorage.setItem("token", res.access_token);
        navigate("/");
      } else {
        setErrorMessage(res.detail || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Login failed. Please try again.");
    }
  };

  return (
    <div className="app-wrapper">
      <div className="auth-container">

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
          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="google-btn primary">
              Sign In
            </button>
          </form>

          {errorMessage && (
            <p style={{ color: "red", marginTop: "10px" }}>
              {errorMessage}
            </p>
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