import { useEffect, useState } from "react";

export default function SuccessScreen({ orderData, onNewOrder, onTrack }) {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    setDots(Array.from({ length: 14 }, (_, i) => ({
      id: i,
      color: i % 3 === 0 ? "#D94F00" : i % 3 === 1 ? "#1A7F4B" : "#1C1C1C",
      left: `${Math.random() * 85 + 5}%`,
      delay: `${Math.random() * 0.6}s`,
      size: Math.random() * 7 + 5,
    })));
  }, []);

  const handleDownload = () => {
    const date = new Date().toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
    const itemLines = orderData.items.map(i => `  ${i.name} x${i.qty}  ₹${i.price * i.qty}`).join("\n");
    const receipt = [
      "=============================",
      "        FOODYBUDDY",
      "   Karunya Canteen Receipt",
      "=============================",
      `Date     : ${date}`,
      `Order ID : ${orderData.razorpay_order_id}`,
      `Name     : ${orderData.name}`,
      `Type     : ${orderData.tokenType}`,
      "-----------------------------",
      "ITEMS:",
      itemLines,
      "-----------------------------",
      `TOTAL    : ₹${orderData.total}`,
      "=============================",
      "   Thank you for ordering!",
      "=============================",
    ].join("\n");

    const blob = new Blob([receipt], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `foodybuddy-receipt-${orderData.razorpay_order_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="success-wrap">
      <div className="success-glow" />

      {dots.map(d => (
        <div key={d.id} className="confetti-dot" style={{
          background: d.color, left: d.left, top:"5%",
          width: d.size, height: d.size, animationDelay: d.delay,
        }} />
      ))}

      <div className="success-icon">✓</div>
      <div className="success-title">Order Placed</div>
      <div className="success-sub">
        Hi {orderData.name}, your {orderData.tokenType} order<br />
        is confirmed and being prepared.
      </div>

      <div className="success-card">
        <div className="order-id-lbl">Order Reference</div>
        <div className="order-id-val">{orderData.razorpay_order_id}</div>
        <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid var(--border)" }}>
          <div style={{ fontSize:13, color:"var(--mid)", marginBottom:4 }}>
            {orderData.items.map(i => `${i.name} ×${i.qty}`).join(", ")}
          </div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:700, color:"var(--primary)" }}>
            Total: ₹{orderData.total}
          </div>
        </div>
      </div>

      <div className="wa-row">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A7F4B" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.18 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.26 6.26l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        <div className="wa-txt">Confirmation sent to +91 {orderData.phone}</div>
      </div>

      {/* Track Order button */}
      <button
        onClick={onTrack}
        style={{ width:"100%", background:"#D94F00", color:"white", border:"none", borderRadius:12, padding:"14px", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:10 }}
      >
        Track My Order
      </button>

      {/* Download Receipt button */}
      <button
        onClick={handleDownload}
        style={{ width:"100%", background:"transparent", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, padding:"13px", fontSize:14, fontWeight:500, cursor:"pointer", marginBottom:10 }}
      >
        ↓ Download Receipt
      </button>

      <button className="btn-secondary" style={{ color:"rgba(255,255,255,0.4)", borderColor:"rgba(255,255,255,0.1)", background:"transparent" }} onClick={onNewOrder}>
        Place Another Order
      </button>
    </div>
  );
}
