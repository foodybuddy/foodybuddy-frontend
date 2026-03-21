import { useState, useEffect } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const CATS = ["meals", "snacks", "drinks"];
const STATUS_FLOW = ["new", "preparing", "ready", "done"];
const STATUS_LABEL = { new: "New", preparing: "Preparing", ready: "Ready", done: "Done" };
const NEXT_LABEL = { new: "Start Preparing", preparing: "Mark Ready", ready: "Mark Done" };
const emptyForm = { name: "", price: "", category: "meals", type: "veg", image: null, preview: null };

export default function AdminPanel({ user, onBack, onLogout }) {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const fetchOrders = () => fetch(`${API}/admin/orders`).then(r => r.json()).then(setOrders).catch(() => { });
  const fetchHistory = () => fetch(`${API}/admin/history`).then(r => r.json()).then(setHistory).catch(() => { });
  const fetchMenu = () => fetch(`${API}/admin/menu`).then(r => r.json()).then(setMenuItems).catch(() => { });

  useEffect(() => { fetchOrders(); const iv = setInterval(fetchOrders, 10000); return () => clearInterval(iv); }, []);
  useEffect(() => { if (tab === "history") fetchHistory(); if (tab === "menu") fetchMenu(); }, [tab]);

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

  const live = orders.filter(o => o.status !== "done");
  const revenue = history.reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      <div className="admin-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="back-btn" style={{ background: "rgba(255,255,255,0.08)", color: "white", borderColor: "rgba(255,255,255,0.15)" }} onClick={onBack}>‹</button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="back-btn" style={{ background: "rgba(255,255,255,0.08)", color: "white", borderColor: "rgba(255,255,255,0.15)" }} onClick={onBack}>‹</button>
            <div>
              <div className="admin-logo"><span className="f">Foody</span><span className="b">Buddy</span></div>
              <div className="admin-meta">Admin · {user.name}</div>
            </div>
            <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600, marginLeft: 4 }}>
              Logout
            </button>
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

        {tab === "history" && (history.length === 0
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
          ))
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
