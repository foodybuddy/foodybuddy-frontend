import { useState } from "react";

export default function CartScreen({ user, cartItems, cartTotal, onBack, onCheckout, addItem, removeItem }) {
  const [tokenType, setTokenType] = useState("dine-in");

  const handleContinue = () => {
    if (!user.phone) return alert("No phone number on your account. Please re-register with your WhatsApp number.");
    onCheckout({ name: user.name, phone: user.phone, tokenType, items: cartItems, total: cartTotal });
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="screen-title">Your Cart</div>
      </div>
      <div className="screen-body">
        {cartItems.map(item => (
          <div className="cart-item" key={item.id}>
            <div className="cart-thumb">
              {item.image_url
                ? <img src={item.image_url} alt={item.name} />
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BDBDBD" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              }
            </div>
            <div className="cart-name">{item.name}</div>
            <div className="cart-price">₹{item.price * item.qty}</div>
            <div className="qty-ctrl">
              <button onClick={() => removeItem(item.id)}>−</button>
              <span>{item.qty}</span>
              <button onClick={() => addItem(item)}>+</button>
            </div>
          </div>
        ))}
        <div className="divider" />
        <div className="total-row">
          <span className="total-label">Total</span>
          <span className="total-val">₹{cartTotal}</span>
        </div>

        <div style={{ background:"var(--light)", borderRadius:"var(--radius-sm)", padding:"10px 14px", marginBottom:16, fontSize:13, color:"var(--mid)", border:"1px solid var(--border)" }}>
          Ordering as <strong style={{ color:"var(--dark)" }}>{user.name}</strong> — WhatsApp confirmation to <strong style={{ color:"var(--dark)" }}>+91 {user.phone}</strong>
        </div>

        <div className="field-label" style={{ marginBottom:8 }}>Order Type</div>
        <div className="token-opts">
          <div className={`token-opt ${tokenType === "dine-in"  ? "active" : ""}`} onClick={() => setTokenType("dine-in")}>Dine-in</div>
          <div className={`token-opt ${tokenType === "takeaway" ? "active" : ""}`} onClick={() => setTokenType("takeaway")}>Takeaway</div>
        </div>

        <button className="btn-primary" onClick={handleContinue}>Continue to Payment</button>
      </div>
    </div>
  );
}
