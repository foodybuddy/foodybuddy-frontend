import { useState } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AuthScreen({ onBack, onAuth }) {
  const [mode,     setMode]     = useState("login");   // login | register
  const [name,     setName]     = useState("");
  const [password, setPassword] = useState("");
  const [phone,    setPhone]    = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body     = mode === "login"
        ? { name: name.trim(), password }
        : { name: name.trim(), password, phone: phone.trim() };

      const res  = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return; }

      // Save user to localStorage
      localStorage.setItem("fb_user", JSON.stringify(data.user));
      onAuth(data.user);
    } catch {
      setError("Cannot connect to server. Is the backend running?");
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="auth-screen">
      <div className="auth-header">
        <button className="auth-back" onClick={onBack}>‹</button>
        <div className="auth-title">{mode === "login" ? "Welcome back" : "Create account"}</div>
        <div className="auth-sub">{mode === "login" ? "Sign in to order from the canteen" : "Join Foody Buddy — it's free"}</div>
      </div>

      <div className="auth-body">
        <div className="auth-card">
          {error && <div className="auth-error">{error}</div>}

          <div className="field">
            <label className="field-label">Full Name</label>
            <input className="field-input" placeholder="e.g. Jachin Samuel" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKey} autoFocus />
          </div>

          {mode === "register" && (
            <div className="field">
              <label className="field-label">WhatsApp Number</label>
              <input className="field-input" placeholder="10-digit number" maxLength={10} value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={handleKey} />
            </div>
          )}

          <div className="field" style={{ marginBottom: 20 }}>
            <label className="field-label">Password</label>
            <input className="field-input" type="password" placeholder={mode === "register" ? "Choose a password" : "Your password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey} />
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>

        <div className="auth-switch">
          {mode === "login"
            ? <>Don't have an account? <span onClick={() => { setMode("register"); setError(""); }}>Register</span></>
            : <>Already have an account? <span onClick={() => { setMode("login"); setError(""); }}>Sign in</span></>
          }
        </div>

        {mode === "login" && (
          <div style={{ marginTop: "1.5rem", padding: "12px 14px", background: "var(--light)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 12, color: "var(--mid)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--dark)" }}>Admin access:</strong> Register with the name "Admin" and the canteen admin password to access the admin panel.
          </div>
        )}
      </div>
    </div>
  );
}
