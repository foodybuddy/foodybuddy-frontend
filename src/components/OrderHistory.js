import { useState, useEffect } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const STATUS_LABEL = { new: "New", preparing: "Preparing", ready: "Ready", done: "Done" };
const STATUS_COLOR = {
  new: { bg: "#FEF2F2", color: "#991B1B" },
  preparing: { bg: "#FFFBEB", color: "#92400E" },
  ready: { bg: "#ECFDF5", color: "#065F46" },
  done: { bg: "#F5F0EB", color: "#6B6B6B" },
};

export default function OrderHistory({ user, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetch(`${API}/orders/history/${user.phone}`)
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user.phone]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(orderId);
    try {
      const res = await fetch(`${API}/orders/${orderId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (data.status === "cancelled") {
        setOrders(orders.filter(o => o.order_id !== orderId));
      } else {
        alert(data.error || "Cannot cancel this order");
      }
    } catch {
      alert("Something went wrong");
    }
    setCancelling(null);
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="screen-title">My Orders</div>
      </div>
      <div className="screen-body">

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div className="spinner" />
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--mid)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--dark)", marginBottom: 6 }}>No orders yet</div>
            <div style={{ fontSize: 13 }}>Your order history will appear here</div>
          </div>
        )}

        {orders.map(order => (
          <div key={order.order_id} style={{
            border: "1px solid var(--bd)", borderRadius: 12,
            padding: 14, marginBottom: 12, background: "white"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 700, color: "var(--dark)" }}>
                  {order.order_id}
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#F5F0EB", color: "var(--mid)", fontWeight: 700, marginLeft: 6, textTransform: "uppercase" }}>
                    {order.token_type}
                  </span>
                  {order.payment_id === "CASH" && (
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#FFFBEB", color: "#92400E", fontWeight: 700, marginLeft: 4, textTransform: "uppercase" }}>Cash</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--mid)", marginTop: 2 }}>
                  {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                background: STATUS_COLOR[order.status]?.bg || "#F5F0EB",
                color: STATUS_COLOR[order.status]?.color || "#6B6B6B",
                textTransform: "uppercase", letterSpacing: "0.04em"
              }}>
                {STATUS_LABEL[order.status] || order.status}
              </div>
            </div>

            <div style={{ fontSize: 13, color: "var(--mid)", marginBottom: 10, lineHeight: 1.6 }}>
              {order.items.map(i => `${i.name} ×${i.qty}`).join(" · ")}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: "var(--or)" }}>
                ₹{order.total}
              </div>
              {order.status === "new" && (
                <button
                  onClick={() => cancelOrder(order.order_id)}
                  disabled={cancelling === order.order_id}
                  style={{
                    fontSize: 12, padding: "7px 14px", borderRadius: 8,
                    background: "white", color: "#991B1B",
                    border: "1px solid #FECACA", cursor: "pointer", fontWeight: 600
                  }}>
                  {cancelling === order.order_id ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}