import { useState, useEffect } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const CATS = [
  { key: "all", label: "All" },
  { key: "meals", label: "Meals" },
  { key: "snacks", label: "Snacks" },
  { key: "drinks", label: "Drinks" },
  { key: "breakfast", label: "Breakfast" },
];

export default function MenuScreen({ user, cart, cartCount, cartTotal, addItem, removeItem, onCartClick, onAdminClick, onLogout, onProfileClick }) {
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/menu`)
      .then(r => r.json())
      .then(data => { setMenu(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = menu.filter(i =>
    (cat === "all" || i.category === cat) &&
    (!search || i.name.toLowerCase().includes(search.toLowerCase()))
  );

  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div>
      <div className="header">
        <div className="header-top">
          <div>
            <div className="logo"><span className="logo-f">Foody</span><span className="logo-b">Buddy</span></div>
            <div className="logo-sub">Karunya Canteen</div>
          </div>
          <div className="header-actions">

            {/* Profile avatar button */}
            <div onClick={onProfileClick} title="My Profile" style={{ width: 38, height: 38, borderRadius: "50%", background: "#D94F00", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "serif", fontSize: 14, fontWeight: 900, color: "white", lineHeight: 1 }}>{initials}</span>
            </div>

            {/* Admin button */}
            {user.role === "admin" && (
              <button className="icon-btn" onClick={onAdminClick} title="Admin Panel">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--dark)" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
              </button>
            )}

            {/* Cart button */}
            <button className="icon-btn filled" onClick={onCartClick} style={{ position: "relative" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
              {cartCount > 0 && <div className="cart-badge">{cartCount}</div>}
            </button>
          </div>
        </div>
        <div className="search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#BDBDBD" strokeWidth="2.5"><circle cx="11" cy="11" r="6" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="cats">
        {CATS.map(c => (
          <div key={c.key} className={`cat ${cat === c.key ? "active" : ""}`} onClick={() => setCat(c.key)}>
            {c.label}
          </div>
        ))}
      </div>

      <div className="section-title">
        {cat === "all" ? "Today's Menu" : CATS.find(c => c.key === cat)?.label}
        {!loading && <span className="section-count">{filtered.length} items</span>}
      </div>

      {loading && <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><div className="spinner" /></div>}

      <div className="menu-grid">
        {!loading && filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2rem", color: "var(--mid)" }}>No items found</div>
        )}
        {filtered.map((item, idx) => {
          const qty = cart[item.id]?.qty || 0;
          return (
            <div className="item-card" key={item.id} style={{ animationDelay: `${idx * 0.04}s` }}>
              <div className="item-img">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} />
                  : <div className="item-no-img">No photo</div>
                }
              </div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-bottom">
                  <div>
                    <div className="item-price">₹{item.price}</div>
                    <span className={`tag ${item.type}`}>{item.type === "veg" ? "Veg" : "Non-veg"}</span>
                  </div>
                  {qty === 0
                    ? <button className="add-btn" onClick={() => addItem(item)}>+</button>
                    : <div className="qty-ctrl">
                      <button onClick={() => removeItem(item.id)}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => addItem(item)}>+</button>
                    </div>
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="spacer-b" />

      {cartCount > 0 && (
        <div className="cart-bar">
          <div className="cart-bar-inner" onClick={onCartClick}>
            <div>
              <div className="cart-bar-count">{cartCount} item{cartCount !== 1 ? "s" : ""}</div>
              <div className="cart-bar-total">₹{cartTotal}</div>
            </div>
            <div className="cart-bar-cta">View Cart</div>
          </div>
        </div>
      )}
    </div>
  );
}
