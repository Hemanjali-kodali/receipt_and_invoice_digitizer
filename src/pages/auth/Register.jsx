import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import "../../styles/Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await api.register({
        name,
        email,
        password,
      });

      if (res.message === "User created") {
        alert("Account created successfully!");
        navigate("/login");
      } else {
        alert(res.detail || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">

        {/* LEFT SIDE */}
        <div className="register-visual">
          <div className="visual-content">
            <div className="receipt-icon">🧾</div>

            <h2>DocuScan</h2>

            <p>
              Turn paper receipts into searchable digital records.
            </p>

            <ul>
              <li>✔ Auto-scan receipts</li>
              <li>✔ Extract totals & dates</li>
              <li>✔ Export to CSV / PDF</li>
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="register-form-section">
          <h2>Create Account</h2>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              className="register-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email"
              className="register-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="register-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="register-btn">
              Create Account
            </button>
          </form>

          <button
            className="login-redirect-btn"
            onClick={() => navigate("/login")}
          >
            Already have an account? Sign In
          </button>

          <p className="register-footer">
            Secure registration powered by FastAPI
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;