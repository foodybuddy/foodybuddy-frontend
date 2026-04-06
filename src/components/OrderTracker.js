import { useState, useEffect, useRef } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const STEPS = [
  { key: "new",       label: "Order Received",     sub: "Your order is confirmed" },
  { key: "preparing", label: "Being Prepared",      sub: "The canteen is cooking your food" },
  { key: "ready",     label: "Ready for Pickup",    sub: "Head to the counter now!" },
  { key: "done",      label: "Collected",           sub: "Enjoy your meal!" },
];

const STATUS_IDX = { new: 0, preparing: 1, ready: 2, done: 3 };

export default function OrderTracker({ orderData, onNewOrder, onBack }) {
  const [status, setStatus]   = useState("new");
  const intervalRef  = useRef(null);

  const orderId = orderData?.razorpay_order_id;

  const fetchStatus = async () => {
    if (!orderData?.phone) return;
    try {
      const res  = await fetch(`${API}/orders/history/${orderData.phone}`);
      const data = await res.json();
      const order = data.find(o => o.order_id === orderId);
      if (order) setStatus(order.status);
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 8000);
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Stop polling once done
  useEffect(() => {
    if (status === "done") clearInterval(intervalRef.current);
  }, [status]);

  const currentIdx = STATUS_IDX[status] ?? 0;
  const isReady    = status === "ready";

  return (
    <div style={{ background: "#1C1C1C", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes trackPulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.6;transform:scale(1.15);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes ping { 0%{transform:scale(1);opacity:0.8;} 100%{transform:scale(2.2);opacity:0;} }
      `}</style>

      {/* Header */}
      <div style={{ padding: "1.25rem 1.25rem 0", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, width: 36, height: 36, color: "white", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        <div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: "white" }}>Track Order</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{orderId}</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "2rem 1.5rem", display: "flex", flexDirection: "column" }}>

        {/* Status Hero */}
        <div style={{ textAlign: "center", marginBottom: "3rem", animation: "fadeUp 0.5s ease both" }}>

          {/* Animated ring */}
          <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 1.5rem" }}>
            {isReady && (
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#1A7F4B", opacity: 0.2, animation: "ping 1.5s ease-out infinite" }} />
            )}
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: isReady ? "#1A7F4B" : status === "done" ? "#1C1C1C" : "#D94F00",
              border: `3px solid ${isReady ? "#1A7F4B" : status === "done" ? "rgba(255,255,255,0.15)" : "#D94F00"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.5s ease"
            }}>
              <span style={{ fontSize: 32 }}>
                {status === "new" ? "🧾" : status === "preparing" ? "👨‍🍳" : status === "ready" ? "✅" : "🍽️"}
              </span>
            </div>
          </div>

          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: "white", marginBottom: 6 }}>
            {STEPS[currentIdx].label}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            {STEPS[currentIdx].sub}
          </div>

          {isReady && (
            <div style={{ marginTop: 14, display: "inline-block", background: "rgba(26,127,75,0.15)", border: "1px solid rgba(26,127,75,0.4)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "#4ADE80", fontWeight: 700, letterSpacing: "0.04em" }}>
              🔔 Head to the counter now
            </div>
          )}
        </div>

        {/* Step progress */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "1.25rem 1.25rem", marginBottom: "1.5rem" }}>
          {STEPS.map((step, i) => {
            const done    = i < currentIdx;
            const current = i === currentIdx;
            const pending = i > currentIdx;
            return (
              <div key={step.key} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: i < STEPS.length - 1 ? 0 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? "#D94F00" : current ? "transparent" : "transparent",
                    border: done ? "none" : current ? "2px solid #D94F00" : "2px solid rgba(255,255,255,0.15)",
                    transition: "all 0.4s ease",
                    animation: current ? "trackPulse 2s ease infinite" : "none"
                  }}>
                    {done
                      ? <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>
                      : <div style={{ width: 8, height: 8, borderRadius: "50%", background: current ? "#D94F00" : "rgba(255,255,255,0.2)" }} />
                    }
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 2, height: 36, background: done ? "#D94F00" : "rgba(255,255,255,0.1)", marginTop: 2, marginBottom: 2, transition: "background 0.4s ease" }} />
                  )}
                </div>
                <div style={{ paddingTop: 4, paddingBottom: i < STEPS.length - 1 ? 36 : 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: pending ? "rgba(255,255,255,0.3)" : "white", transition: "color 0.4s" }}>{step.label}</div>
                  {current && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{step.sub}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Order Summary</div>
          {orderData?.items?.map(i => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.6)", padding: "3px 0" }}>
              <span>{i.name} ×{i.qty}</span>
              <span style={{ color: "white", fontWeight: 500 }}>₹{i.price * i.qty}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Total</span>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: "#D94F00" }}>₹{orderData?.total}</span>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", marginBottom: "1.5rem" }}>
          Auto-refreshing every 8 seconds
        </div>

        <button onClick={onNewOrder} style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "14px", color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.5)"; e.target.style.color = "white"; }} onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.3)"; e.target.style.color = "rgba(255,255,255,0.8)"; }}>
          Place Another Order
        </button>
      </div>
    </div>
  );
}
