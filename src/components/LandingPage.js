export default function LandingPage({ onLogin }) {
  return (
    <div className="landing">
      <div className="landing-pattern" />
      <div className="landing-accent" />
      <div className="landing-accent-2" />
      <div className="landing-body">
        <div className="landing-top">
          <div className="landing-chip" style={{ animationDelay: "0.1s" }}>
            <div className="chip-dot" />
            Karunya College
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: "1.5rem" }}>
            <span style={{ color: "var(--primary)" }}>Foody</span>
            <span style={{ color: "white" }}>Buddy</span>
          </div>

          <div className="landing-h1" style={{ animationDelay: "0.2s" }}>
            The<br />
            <em>Smarter</em><br />
            Way to<br />
            Eat.
          </div>
          <p className="landing-desc" style={{ animationDelay: "0.3s" }}>
            Order from the canteen, pay online,<br />
            and collect when it's ready — no queue.
          </p>
        </div>
        <div className="landing-bottom">
          <button className="landing-btn" onClick={onLogin}>
            Get Started
          </button>
          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>
            Login with your name and password
          </p>
        </div>
      </div>
    </div>
  );
}
