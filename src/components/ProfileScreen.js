import { useState, useEffect } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const STATUS_LABEL = { new: "New", preparing: "Preparing", ready: "Ready", done: "Done" };
const STATUS_COLOR = {
  new: { bg: "#FEF2F2", color: "#991B1B" },
  preparing: { bg: "#FFFBEB", color: "#92400E" },
  ready: { bg: "#ECFDF5", color: "#065F46" },
  done: { bg: "#F5F0EB", color: "#6B6B6B" },
};

export default function ProfileScreen({ user, onBack, onLogout, onUserUpdate }) {
  const [tab, setTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");

  useEffect(() => {
    if (tab === "orders") {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${API}/orders/history/${user.phone}`)
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const saveProfile = async () => {
    if (!name.trim()) return alert("Name cannot be empty");
    if (phone && phone.length !== 10) return alert("Enter a valid 10-digit phone number");
    setSaving(true);
    try {
      const res = await fetch(`${API}/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, name: name.trim(), phone: phone.trim() })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to update"); setSaving(false); return; }
      const updated = { ...user, name: data.name, phone: data.phone };
      localStorage.setItem("fb_user", JSON.stringify(updated));
      if (onUserUpdate) onUserUpdate(updated);
      setEditing(false);
      showToast("Profile updated!");
    } catch { alert("Something went wrong"); }
    setSaving(false);
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(orderId);
    try {
      const res = await fetch(`${API}/orders/${orderId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (data.status === "cancelled") setOrders(orders.filter(o => o.order_id !== orderId));
      else alert(data.error || "Cannot cancel this order");
    } catch { alert("Something went wrong"); }
    setCancelling(null);
  };

  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--bd)", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, background: "white", zIndex: 5 }}>
        <button className="back-btn" onClick={onBack}>‹</button>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 700, color: "var(--dark)" }}>My Profile</div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ margin: "0.75rem 1.25rem 0", background: "#ECFDF5", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#065F46", fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Profile hero */}
      <div style={{ background: "var(--dark)", padding: "2rem 1.25rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--or)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(255,255,255,0.15)" }}>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 900, color: "white" }}>{initials}</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 900, color: "white" }}>{user.name}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>+91 {user.phone || "No phone added"}</div>
          {user.role === "admin" && (
            <div style={{ marginTop: 6, fontSize: 11, background: "rgba(217,79,0,0.2)", color: "var(--or)", border: "1px solid rgba(217,79,0,0.3)", borderRadius: 20, padding: "3px 10px", display: "inline-block", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Admin</div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--bd)" }}>
        {["profile", "orders"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ flex: 1, textAlign: "center", padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: tab === t ? "var(--or)" : "var(--mid)", borderBottom: tab === t ? "2px solid var(--or)" : "2px solid transparent", marginBottom: -1, transition: "all 0.2s", textTransform: "capitalize" }}>
            {t === "profile" ? "Profile" : "My Orders"}
          </div>
        ))}
      </div>

      <div style={{ padding: "1.25rem" }}>

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <div>
            {!editing ? (
              <>
                {[
                  { label: "Full Name", value: user.name },
                  { label: "WhatsApp Number", value: user.phone ? `+91 ${user.phone}` : "Not added" },
                  { label: "Role", value: user.role === "admin" ? "Admin" : "Student / Staff" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--bd)" }}>
                    <div style={{ fontSize: 12, color: "var(--mid)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--dark)" }}>{item.value}</div>
                  </div>
                ))}
                <button onClick={() => setEditing(true)} className="btn-primary" style={{ marginTop: 20 }}>Edit Profile</button>
                <button onClick={onLogout} className="btn-secondary" style={{ marginTop: 10, color: "#991B1B", borderColor: "#FECACA" }}>Logout</button>
              </>
            ) : (
              <>
                <div className="field-label">Full Name</div>
                <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                <div className="field-label">WhatsApp Number</div>
                <input className="field-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit number" maxLength={10} />
                <button onClick={saveProfile} className="btn-primary" disabled={saving} style={{ marginTop: 4 }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => { setEditing(false); setName(user.name); setPhone(user.phone || ""); }} className="btn-secondary" style={{ marginTop: 10 }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div>
            {loading && <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><div className="spinner" /></div>}
            {!loading && orders.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--mid)" }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: "var(--dark)", marginBottom: 6 }}>No orders yet</div>
                <div style={{ fontSize: 13 }}>Your order history will appear here</div>
              </div>
            )}
            {orders.map(order => (
              <div key={order.order_id} style={{ border: "1px solid var(--bd)", borderRadius: "var(--radius)", padding: 14, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: 14, fontWeight: 700, color: "var(--dark)" }}>
                      {order.order_id}
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#F5F0EB", color: "var(--mid)", fontWeight: 700, marginLeft: 6, textTransform: "uppercase" }}>{order.token_type}</span>
                      {order.payment_id === "CASH" && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#FFFBEB", color: "#92400E", fontWeight: 700, marginLeft: 4, textTransform: "uppercase" }}>Cash</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--mid)", marginTop: 2 }}>
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: STATUS_COLOR[order.status]?.bg || "#F5F0EB", color: STATUS_COLOR[order.status]?.color || "#6B6B6B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {STATUS_LABEL[order.status] || order.status}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--mid)", marginBottom: 10, lineHeight: 1.6 }}>
                  {order.items.map(i => `${i.name} ×${i.qty}`).join(" · ")}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: "var(--or)" }}>₹{order.total}</div>
                  {order.status === "new" && (
                    <button onClick={() => cancelOrder(order.order_id)} disabled={cancelling === order.order_id} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, background: "white", color: "#991B1B", border: "1px solid #FECACA", cursor: "pointer", fontWeight: 600 }}>
                      {cancelling === order.order_id ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
