import { useEffect, useState } from "react";

export default function LandingPage({ onLogin }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div style={{
      background: "#1C1C1C", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      justifyContent: "space-between", padding: "3.5rem 1.75rem 2.5rem",
      position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
        backgroundSize: "20px 20px"
      }} />
      <div style={{
        position: "absolute", width: 320, height: 320, borderRadius: "50%",
        background: "#D94F00", opacity: 0.08, filter: "blur(80px)",
        top: -100, right: -80, animation: "blob1 6s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute", width: 200, height: 200, borderRadius: "50%",
        background: "#D94F00", opacity: 0.05, filter: "blur(60px)",
        bottom: 80, left: -60, animation: "blob2 8s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute", width: 150, height: 150, borderRadius: "50%",
        background: "#FF8C42", opacity: 0.06, filter: "blur(50px)",
        top: "45%", right: 20, animation: "blob1 5s ease-in-out infinite reverse"
      }} />

      <style>{`
        @keyframes blob1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-20px,20px) scale(1.1); }
        }
        @keyframes blob2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-15px) scale(1.08); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(30px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeSlideUp2 {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(217,79,0,0.4); }
          50%      { box-shadow: 0 0 0 12px rgba(217,79,0,0); }
        }
        @keyframes shimmer {
          from { background-position: -200% 0; }
          to   { background-position:  200% 0; }
        }
      `}</style>

      {/* Top content */}
      <div style={{ position: "relative", zIndex: 2 }}>

        {/* Brand name */}
        <div style={{
          fontSize: 46, fontWeight: 900, letterSpacing: "-1.5px",
          marginBottom: "2rem", lineHeight: 1,
          opacity: visible ? 1 : 0,
          animation: visible ? "fadeSlideUp 0.6s ease 0.1s both" : "none"
        }}>
          <span style={{ color: "#D94F00" }}>Foody</span>
          <span style={{ color: "white" }}>Buddy</span>
        </div>

        {/* Heading */}
        <div style={{
          fontSize: 52, fontWeight: 900, lineHeight: 1.0,
          color: "white", marginBottom: "1.25rem", letterSpacing: "-2px",
          animation: visible ? "fadeSlideUp 0.6s ease 0.25s both" : "none",
          opacity: visible ? 1 : 0,
        }}>
          The<br />
          <span style={{ color: "#D94F00" }}>Smarter</span><br />
          Way to<br />
          Eat.
        </div>

        {/* Description */}
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.45)",
          lineHeight: 1.75, marginBottom: "3rem",
          animation: visible ? "fadeSlideUp 0.6s ease 0.4s both" : "none",
          opacity: visible ? 1 : 0,
        }}>
          Order from the canteen, pay online,<br />
          and collect when it's ready — no queue.
        </p>

      </div>

      {/* Bottom button */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <button
          onClick={onLogin}
          style={{
            width: "100%", background: "#D94F00", color: "white",
            border: "none", borderRadius: 16, padding: "16px",
            fontSize: 17, fontWeight: 700, cursor: "pointer",
            letterSpacing: "0.02em", marginBottom: 12,
            animation: visible ? "fadeSlideUp 0.6s ease 0.55s both, pulse 2.5s ease 1.5s infinite" : "none",
            opacity: visible ? 1 : 0,
            position: "relative", overflow: "hidden",
          }}
        >
          <span style={{ position: "relative", zIndex: 1 }}>Get Started</span>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.5s infinite"
          }} />
        </button>

        <p style={{
          textAlign: "center", fontSize: 12,
          color: "rgba(255,255,255,0.2)", fontWeight: 500,
          animation: visible ? "fadeSlideUp 0.6s ease 0.65s both" : "none",
          opacity: visible ? 1 : 0,
        }}>
          Login with your name and password
        </p>
      </div>

    </div>
  );
}