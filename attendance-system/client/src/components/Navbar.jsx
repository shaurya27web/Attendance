import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav
      style={{
        background: "#0f1218",
        borderBottom: "1px solid #252d3d",
        padding: "0 28px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "18px",
          color: "#00d4ff",
          letterSpacing: "-1px",
        }}
      >
        ATTEND<span style={{ color: "#e8edf5" }}>X</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0099cc, #00d4ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 700,
            color: "#000",
          }}
        >
          {user && user.name ? user.name.charAt(0).toUpperCase() : "T"}
        </div>
        <span style={{ color: "#8896a8", fontSize: "14px" }}>
          {user ? user.name : ""}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "1px solid #2e3a4e",
            color: "#8896a8",
            padding: "6px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = "#ff4545";
            e.target.style.color = "#ff4545";
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = "#2e3a4e";
            e.target.style.color = "#8896a8";
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}