import { useState, useEffect, useRef, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const CATS = ["meals", "snacks", "drinks", "shawarma", "hotdog", "sub", "toast", "salad", "mojito", "milkshakes", "desserts", "pizza", "burger", "sandwich", "starters", "freshjuice", "pasta"];
const STATUS_FLOW = ["new", "preparing", "ready", "done"];
const STATUS_LABEL = { new: "New", preparing: "Preparing", ready: "Ready", done: "Done" };
const NEXT_LABEL = { new: "Start Preparing", preparing: "Mark Ready", ready: "Mark Done" };
const emptyAddon = { name: "", price: "" };
const emptyForm = { name: "", price: "", category: "meals", type: "veg", image: null, preview: null, addons: [] };

export default function AdminPanel({ user, onBack }) {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [newAddon, setNewAddon] = useState(emptyAddon);
  const [clearing, setClearing] = useState(false);

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
  }).catch(() => {}), []);

  const fetchHistory = useCallback(() => fetch(`${API}/admin/history`).then(r => r.json()).then(setHistory).catch(() => {}), []);
  const fetchMenu = useCallback(() => fetch(`${API}/admin/menu`).then(r => r.json()).then(setMenuItems).catch(() => {}), []);

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(fetchOrders, 10000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  useEffect(() => {
    if (tab === "history") fetchHistory();
    if (tab === "menu") fetchMenu();
  }, [tab, fetchHistory, fetchMenu]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, image: file, preview: URL.createObjectURL(file) }));
  };

  // ── addon helpers ──────────────────────────────────────────────────────────
  const addAddonRow = () => {
    const name = newAddon.name.trim();
    if (!name) return;
    setForm(f => ({ ...f, addons: [...f.addons, { name, price: parseInt(newAddon.price) || 0 }] }));
    setNewAddon(emptyAddon);
  };

  const removeAddonRow = (idx) => {
    setForm(f => ({ ...f, addons: f.addons.filter((_, i) => i !== idx) }));
  };

  // ── edit/submit ────────────────────────────────────────────────────────────
  const startEdit = (item) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      price: item.price,
      category: item.category,
      type: item.type,
      image: null,
      preview: item.image_url,
      addons: (item.addons || []).map(a => ({ name: a.name, price: a.price })),
    });
    setNewAddon(emptyAddon);
    window.scrollTo(0, 0);
  };

  const submitForm = async () => {
    if (!form.name || !form.price) return alert("Name and price are required");
    setLoading(true);
    const fd = new FormData();
    ["name", "price", "category", "type"].forEach(k => fd.append(k, form[k]));
    fd.append("addons", JSON.stringify(form.addons));
    if (form.image) fd.append("image", form.image);
    const url = editId ? `${API}/admin/menu/${editId}` : `${API}/admin/menu`;
    const method = editId ? "PUT" : "POST";
    await fetch(url, { method, body: fd });
    setLoading(false); setEditId(null); setForm(emptyForm); setNewAddon(emptyAddon);
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

        {/* ── ORDERS ── */}
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

        {/* ── HISTORY ── */}
        {tab === "history" && (
          <div>
            {history.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA" }}>
                <div style={{ fontSize: 13, color: "#991B1B", fontWeight: 600 }}>
                  {history.length} completed · ₹{revenue} total revenue
                </div>
                <button onClick={clearHistory} disabled={clearing} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, background: "white", color: "#991B1B", border: "1px solid #FECACA", cursor: "pointer", fontWeight: 700, opacity: clearing ? 0.6 : 1 }}>
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

        {/* ── MENU ── */}
        {tab === "menu" && (
          <div>
            <div className="menu-form">
              <div className="menu-form-ttl">{editId ? "Edit Item" : "Add New Item"}</div>

              {/* Image upload */}
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

              {/* Name */}
              <div className="field">
                <label className="field-label">Item Name</label>
                <input className="field-input" placeholder="e.g. Chicken Biryani" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              {/* Price */}
              <div className="field">
                <label className="field-label">Price (₹)</label>
                <input className="field-input" type="number" placeholder="e.g. 80" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>

              {/* Category + Type */}
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

              {/* ── ADDONS SECTION ── */}
              <div style={{ marginBottom: 16 }}>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span>🧀</span> Addons / Extras
                  <span style={{ fontSize: 11, color: "#9E9E9E", fontWeight: 400 }}>(optional – e.g. Extra Cheese, Sauce)</span>
                </label>

                {/* Existing addon rows */}
                {form.addons.length > 0 && (
                  <div style={{ marginBottom: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                    {form.addons.map((addon, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFF8F3", border: "1px solid #FFE0CC", borderRadius: 8, padding: "8px 10px" }}>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#333" }}>{addon.name}</span>
                        <span style={{ fontSize: 13, color: "#D94F00", fontWeight: 700, minWidth: 48, textAlign: "right" }}>
                          {addon.price > 0 ? `+₹${addon.price}` : "Free"}
                        </span>
                        <button
                          onClick={() => removeAddonRow(idx)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#BDBDBD", lineHeight: 1, padding: "0 2px" }}
                          title="Remove addon"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New addon input row */}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    className="field-input"
                    style={{ flex: 2, marginBottom: 0 }}
                    placeholder="Addon name (e.g. Extra Cheese)"
                    value={newAddon.name}
                    onChange={e => setNewAddon(a => ({ ...a, name: e.target.value }))}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addAddonRow(); } }}
                  />
                  <input
                    className="field-input"
                    style={{ flex: 1, marginBottom: 0 }}
                    type="number"
                    placeholder="Price (₹)"
                    value={newAddon.price}
                    onChange={e => setNewAddon(a => ({ ...a, price: e.target.value }))}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addAddonRow(); } }}
                    min="0"
                  />
                  <button
                    onClick={addAddonRow}
                    disabled={!newAddon.name.trim()}
                    style={{
                      flexShrink: 0,
                      height: 40,
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "none",
                      background: newAddon.name.trim() ? "#D94F00" : "#EEE",
                      color: newAddon.name.trim() ? "white" : "#999",
                      fontWeight: 700,
                      fontSize: 18,
                      cursor: newAddon.name.trim() ? "pointer" : "default",
                      transition: "background 0.2s",
                    }}
                    title="Add addon"
                  >+</button>
                </div>
                {form.addons.length === 0 && (
                  <div style={{ fontSize: 11, color: "#BDBDBD", marginTop: 5 }}>No addons yet. Type a name above and press + to add.</div>
                )}
              </div>

              <button className="btn-primary" onClick={submitForm} disabled={loading}>
                {loading ? "Saving..." : editId ? "Save Changes" : "Add Item"}
              </button>
              {editId && <button className="btn-secondary" onClick={() => { setEditId(null); setForm(emptyForm); setNewAddon(emptyAddon); }}>Cancel</button>}
            </div>

            {/* Menu list */}
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
                    <div className="menu-item-sub">
                      ₹{item.price} · {item.category} · <span className={`tag ${item.type}`}>{item.type}</span>
                    </div>
                    {item.addons && item.addons.length > 0 && (
                      <div style={{ marginTop: 3, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {item.addons.map(a => (
                          <span key={a.id} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#FFF3EC", color: "#D94F00", border: "1px solid #FFD5B8", fontWeight: 600 }}>
                            {a.name}{a.price > 0 ? ` +₹${a.price}` : ""}
                          </span>
                        ))}
                      </div>
                    )}
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
