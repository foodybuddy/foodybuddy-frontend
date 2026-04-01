import { useEffect, useState } from "react";

export default function LandingPage({ onLogin }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div style={{ background: "#111", minHeight: "100vh", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes rise { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer { from { background-position:-200% 0; } to { background-position:200% 0; } }
        @keyframes lineGrow { from { width:0; } to { width:100%; } }

        .lp-root {
          position: relative; z-index: 2; flex: 1;
          display: flex; flex-direction: column;
          padding: 2.5rem 2rem 2.5rem;
          min-height: 100vh;
        }

        @media (min-width: 1024px) {
          .lp-root { flex-direction: row; padding: 0; }
          .lp-left {
            flex: 1; display: flex; flex-direction: column;
            justify-content: center;
            padding: 6rem 5rem 6rem 8rem;
            border-right: 1px solid rgba(255,255,255,0.07);
          }
          .lp-right {
            width: 360px; flex-shrink: 0;
            display: flex !important; flex-direction: column;
            justify-content: center; padding: 6rem 3.5rem;
          }
          .lp-cta-mobile { display: none !important; }
          .lp-cta-desktop { display: block !important; }
        }

        @media (max-width: 1023px) {
          .lp-left { width: 100%; }
          .lp-right { display: none; }
          .lp-cta-mobile { display: block; }
          .lp-cta-desktop { display: none; }
        }

        .lp-cta-btn {
          width: 100%; background: #D94F00; color: white;
          border: none; border-radius: 4px; padding: 17px;
          font-family: 'DM Sans', sans-serif; font-size: 15px;
          font-weight: 500; cursor: pointer;
          letter-spacing: 0.1em; text-transform: uppercase;
          transition: background 0.2s, transform 0.15s;
          position: relative; overflow: hidden;
        }
        .lp-cta-btn:hover { background: #bf4400; }
        .lp-cta-btn:active { transform: scale(0.99); }
        .lp-cta-btn .shimmer-layer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        .lp-nav-line {
          width: 0; height: 1px;
          background: rgba(255,255,255,0.12);
          animation: lineGrow 1.2s ease 0.4s forwards;
        }
      `}</style>

      {/* Grain */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundSize: "180px 180px", opacity: 0.4
      }} />

      {/* Accent glow */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "#D94F00", opacity: 0.06, filter: "blur(120px)", top: -200, right: -100, pointerEvents: "none", zIndex: 1 }} />

      <div className="lp-root">

        {/* LEFT */}
        <div className="lp-left" style={{ position: "relative", zIndex: 2 }}>

          {/* Nav row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3.5rem", opacity: visible ? 1 : 0, animation: visible ? "fadeIn 0.5s ease 0.1s both" : "none" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Karunya Institute of Technology and Sciences
            </div>
          </div>

          {/* Brand wordmark — BIG */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(42px, 5vw, 72px)",
            fontWeight: 900,
            letterSpacing: "-1px",
            marginBottom: "1.5rem",
            opacity: visible ? 1 : 0,
            animation: visible ? "rise 0.7s ease 0.15s both" : "none"
          }}>
            <span style={{ color: "#D94F00" }}>Foody</span>
            <span style={{ color: "white" }}>Buddy</span>
          </div>

          {/* Headline */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(48px, 5.5vw, 82px)",
            fontWeight: 750,
            lineHeight: 0.90,
            letterSpacing: "-2px",
            color: "#fff",
            marginBottom: "2rem",
            opacity: visible ? 1 : 0,
            animation: visible ? "rise 0.8s ease 0.25s both" : "none"
          }}>
            Eat<br />
            <span style={{ fontStyle: "italic", color: "#D94F00" }}>Without</span><br />
            Waiting.
          </div>

          {/* Thin rule */}
          <div className="lp-nav-line" style={{ marginBottom: "1.75rem" }} />

          {/* Tagline */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(14px, 1.1vw, 15px)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.8,
            marginBottom: "3rem",
            letterSpacing: "0.01em",
            maxWidth: 360,
            opacity: visible ? 1 : 0,
            animation: visible ? "rise 0.7s ease 0.45s both" : "none"
          }}>
            Pre-order from the canteen. Pay instantly.<br />Collect when ready — zero queue.
          </p>

          {/* Mobile CTA */}
          <div className="lp-cta-mobile" style={{ opacity: visible ? 1 : 0, animation: visible ? "rise 0.7s ease 0.55s both" : "none" }}>
            <button className="lp-cta-btn" onClick={onLogin}>
              <span style={{ position: "relative", zIndex: 1 }}>Get Started</span>
              <div className="shimmer-layer" />
            </button>
          </div>

        </div>

        {/* RIGHT — desktop only */}
        <div className="lp-right" style={{ position: "relative", zIndex: 2 }}>
          <div className="lp-cta-desktop" style={{ opacity: visible ? 1 : 0, animation: visible ? "rise 0.7s ease 0.5s both" : "none" }}>
            <button className="lp-cta-btn" onClick={onLogin} style={{ marginBottom: 14 }}>
              <span style={{ position: "relative", zIndex: 1 }}>Get Started</span>
              <div className="shimmer-layer" />
            </button>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.18)", textAlign: "center", letterSpacing: "0.06em" }}>
              USE YOUR NAME & PASSWORD TO SIGN IN
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
