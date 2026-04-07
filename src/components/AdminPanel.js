import { useState, useEffect, useRef, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const CATS = ["meals", "snacks", "drinks", "shawarma", "hotdog", "sub", "toast", "salad", "mojito", "milkshakes", "desserts", "pizza", "burger", "sandwich", "starters", "freshjuice", "pasta"];
const STATUS_FLOW = ["new", "preparing", "ready", "done"];
const STATUS_LABEL = { new: "New", preparing: "Preparing", ready: "Ready", done: "Done" };
const NEXT_LABEL = { new: "Start Preparing", preparing: "Mark Ready", ready: "Mark Done" };
const emptyForm = { name: "", price: "", category: "meals", type: "veg", image: null, preview: null };

export default function AdminPanel({ user, onBack }) {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const prevOrderCount = useRef(null);

  const playAlert = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 120, 240].forEach(delay => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.setValueAtTime(0, ctx.currentTime + delay / 1000);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + delay / 1000 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay / 1000 + 0.25);
        osc.start(ctx.currentTime + delay / 1000);
        osc.stop(ctx.currentTime + delay / 1000 + 0.3);
      });
    } catch {}
  };

  const fetchOrders = useCallback(() => fetch(`${API}/admin/orders`).then(r => r.json()).then(data => {
    const newCount = data.filter(o => o.status === "new").length;
    if (prevOrderCount.current !== null && newCount > prevOrderCount.current) playAlert();
    prevOrderCount.current = newCount;
    setOrders(data);
  }).catch(() => { }), []);
  const fetchHistory = useCallback(() => fetch(`${API}/admin/history`).then(r => r.json()).then(setHistory).catch(() => { }), []);
  const fetchMenu = useCallback(() => fetch(`${API}/admin/menu`).then(r => r.json()).then(setMenuItems).catch(() => { }), []);

  useEffect(() => { 
    fetchOrders(); 
    const iv = setInterval(fetchOrders, 10000); 
    return () => clearInterval(iv); 
  }, [fetchOrders]);
  useEffect(() => { if (tab === "history") fetchHistory(); if (tab === "menu") fetchMenu(); }, [tab, fetchHistory, fetchMenu]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, image: file, preview: URL.createObjectURL(file) }));
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setForm({ name: item.name, price: item.price, category: item.category, type: item.type, image: null, preview: item.image_url });
    window.scrollTo(0, 0);
  };

  const submitForm = async () => {
    if (!form.name || !form.price) return alert("Name and price are required");
    setLoading(true);
    const fd = new FormData();
    ["name", "price", "category", "type"].forEach(k => fd.append(k, form[k]));
    if (form.image) fd.append("image", form.image);
    const url = editId ? `${API}/admin/menu/${editId}` : `${API}/admin/menu`;
    const method = editId ? "PUT" : "POST";
    await fetch(url, { method, body: fd });
    setLoading(false); setEditId(null); setForm(emptyForm);
    fetchMenu(); showToast(editId ? "Item updated" : "Item added to menu");
  };

  const toggleItem = async (id) => { await fetch(`${API}/admin/menu/${id}/toggle`, { method: "PATCH" }); fetchMenu(); };
  const deleteItem = async (id) => { if (!window.confirm("Delete this item?")) return; await fetch(`${API}/admin/menu/${id}`, { method: "DELETE" }); fetchMenu(); showToast("Item removed"); };
  const advanceOrder = async (orderId, status) => {
    const next = STATUS_FLOW[STATUS_FLOW.indexOf(status) + 1];
    await fetch(`${API}/admin/orders/${orderId}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    fetchOrders();
  };
  const cancelOrder = async (id) => { await fetch(`${API}/admin/orders/${id}/cancel`, { method: "POST" }); fetchOrders(); };

  const [clearing, setClearing] = useState(false);

  const clearHistory = async () => {
    if (!window.confirm("Clear all completed orders and reset today's revenue? This cannot be undone.")) return;
    setClearing(true);
    try {
      const res = await fetch(`${API}/admin/clear-history`, { method: "POST" });
      const data = await res.json();
      if (data.status === "cleared") {
        setHistory([]);
        showToast(`Cleared ${data.deleted} completed order${data.deleted !== 1 ? "s" : ""}`);
      }
    } catch { alert("Something went wrong"); }
    setClearing(false);
  };

  const live = orders.filter(o => o.status !== "done");
  const revenue = history.reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      <div className="admin-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="back-btn" style={{ background: "rgba(255,255,255,0.08)", color: "white", borderColor: "rgba(255,255,255,0.15)" }} onClick={onBack}>‹</button>
          <div>
            <div className="admin-logo"><span className="f">Foody</span><span className="b">Buddy</span></div>
            <div className="admin-meta">Admin · {user.name}</div>
          </div>
        </div>
        <div className="live-indicator"><div className="live-dot" /> Live</div>
      </div>

      <div className="stats-row">
        <div className="stat-box s1"><div className="stat-val">{orders.filter(o => o.status === "new").length}</div><div className="stat-label">New</div></div>
        <div className="stat-box s2"><div className="stat-val">{orders.filter(o => o.status === "preparing").length}</div><div className="stat-label">Cooking</div></div>
        <div className="stat-box s3"><div className="stat-val">{orders.filter(o => o.status === "ready").length}</div><div className="stat-label">Ready</div></div>
        <div className="stat-box s4"><div className="stat-val">₹{revenue}</div><div className="stat-label">Revenue</div></div>
      </div>

      {toast && <div className="toast">{toast}</div>}

      <div className="tab-bar">
        <div className={`tab-item ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>Live Orders</div>
        <div className={`tab-item ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>History</div>
        <div className={`tab-item ${tab === "menu" ? "active" : ""}`} onClick={() => setTab("menu")}>Menu</div>
      </div>

      <div style={{ padding: "0.75rem 1.25rem" }}>

        {tab === "orders" && (live.length === 0
          ? <div className="empty">No active orders</div>
          : live.map(o => (
            <div className="order-card" key={o.order_id}>
              <div className="order-top">
                <div>
                  <div className="oid">{o.order_id}<span className="token-pill">{o.token_type}</span>{o.payment_id === "CASH" && (<span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#FFFBEB", color: "#92400E", fontWeight: 700, marginLeft: 4, textTransform: "uppercase" }}>Cash</span>)}</div>
                  <div className="order-meta">{o.name} · {o.phone}</div>
                </div>
                <div className={`status-pill sp-${o.status}`}>{STATUS_LABEL[o.status]}</div>
              </div>
              <div className="order-items-txt">{o.items.map(i => `${i.name} ×${i.qty}`).join(" · ")}</div>
              <div className="order-bottom">
                <div className="order-total">₹{o.total}</div>
                <div className="act-btns">
                  {o.status !== "ready" && <button className="btn-cancel" onClick={() => cancelOrder(o.order_id)}>Cancel</button>}
                  {o.status !== "done" && <button className="btn-next" onClick={() => advanceOrder(o.order_id, o.status)}>{NEXT_LABEL[o.status]}</button>}
                </div>
              </div>
            </div>
          ))
        )}

        {tab === "history" && (
          <div>
            {history.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA" }}>
                <div style={{ fontSize: 13, color: "#991B1B", fontWeight: 600 }}>
                  {history.length} completed · ₹{revenue} total revenue
                </div>
                <button
                  onClick={clearHistory}
                  disabled={clearing}
                  style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, background: "white", color: "#991B1B", border: "1px solid #FECACA", cursor: "pointer", fontWeight: 700, opacity: clearing ? 0.6 : 1 }}
                >
                  {clearing ? "Clearing..." : "🗑 Clear History"}
                </button>
              </div>
            )}
            {history.length === 0
              ? <div className="empty">No completed orders yet</div>
              : history.map(o => (
            <div className="order-card" key={o.order_id}>
              <div className="order-top">
                <div><div className="order-id">{o.order_id}</div><div className="order-meta">{o.name}</div></div>
                <div className="status-pill sp-done">Done</div>
              </div>
              <div className="order-items-txt">{o.items.map(i => `${i.name} ×${i.qty}`).join(" · ")}</div>
              <div className="order-bottom"><div className="order-total">₹{o.total}</div></div>
            </div>
          ))}
          </div>
        )}

        {tab === "menu" && (
          <div>
            <div className="menu-form">
              <div className="menu-form-ttl">{editId ? "Edit Item" : "Add New Item"}</div>
              <label className="img-upload">
                <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
                {form.preview
                  ? <img src={form.preview} alt="preview" />
                  : <div className="img-ph">
                    <svg className="img-ph-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#BDBDBD" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                    <div className="img-ph-txt">Click to upload food photo</div>
                  </div>
                }
              </label>

              <div className="field">
                <label className="field-label">Item Name</label>
                <input className="field-input" placeholder="e.g. Chicken Biryani" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Price (₹)</label>
                <input className="field-input" type="number" placeholder="e.g. 80" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="two-col" style={{ marginBottom: 16 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="field-label">Category</label>
                  <select className="field-input" style={{ marginBottom: 0 }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="field-label">Type</label>
                  <select className="field-input" style={{ marginBottom: 0 }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="veg">Veg</option>
                    <option value="nonveg">Non-veg</option>
                  </select>
                </div>
              </div>
              <button className="btn-primary" onClick={submitForm} disabled={loading}>
                {loading ? "Saving..." : editId ? "Save Changes" : "Add Item"}
              </button>
              {editId && <button className="btn-secondary" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</button>}
            </div>

            {menuItems.length === 0
              ? <div className="empty">No items yet. Add your first item above.</div>
              : menuItems.map(item => (
                <div key={item.id} className={`menu-row ${!item.available ? "menu-unavailable" : ""}`}>
                  <div className="menu-thumb">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} />
                      : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#BDBDBD" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="menu-item-name">{item.name}</div>
                    <div className="menu-item-sub">₹{item.price} · {item.category} · <span className={`tag ${item.type}`}>{item.type}</span></div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <div className={`tog ${item.available ? "on" : "off"}`} onClick={() => toggleItem(item.id)}><div className="tog-knob" /></div>
                    <button className="btn-sm-edit" onClick={() => startEdit(item)}>Edit</button>
                    <button className="btn-sm-del" onClick={() => deleteItem(item.id)}>Delete</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
