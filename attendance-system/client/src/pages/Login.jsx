import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    background: "#161b24",
    border: "1px solid #2e3a4e",
    borderRadius: "8px",
    padding: "12px 14px",
    color: "#e8edf5",
    fontSize: "15px",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0c10",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "32px",
              color: "#00d4ff",
              letterSpacing: "-1px",
            }}
          >
            ATTEND<span style={{ color: "#e8edf5" }}>X</span>
          </div>
          <div style={{ color: "#4a5568", fontSize: "13px", marginTop: "6px" }}>
            Smart Attendance System
          </div>
        </div>

        <div
          style={{
            background: "#1a2030",
            border: "1px solid #252d3d",
            borderRadius: "12px",
            padding: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#e8edf5",
              marginBottom: "24px",
            }}
          >
            Teacher Sign In
          </h2>

          {error && (
            <div
              style={{
                background: "rgba(255,69,69,0.1)",
                border: "1px solid rgba(255,69,69,0.3)",
                color: "#ff4545",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: "#8896a8",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "8px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.edu"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#00d4ff")}
                onBlur={(e) => (e.target.style.borderColor = "#2e3a4e")}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  color: "#8896a8",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#00d4ff")}
                onBlur={(e) => (e.target.style.borderColor = "#2e3a4e")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                background: loading ? "#2e3a4e" : "#00d4ff",
                color: loading ? "#4a5568" : "#000",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}