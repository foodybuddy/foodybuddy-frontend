import { useState, useEffect } from "react";
import LandingPage   from "./components/LandingPage";
import AuthScreen    from "./components/AuthScreen";
import MenuScreen    from "./components/MenuScreen";
import CartScreen    from "./components/CartScreen";
import PaymentScreen from "./components/PaymentScreen";
import SuccessScreen from "./components/SuccessScreen";
import OrderTracker  from "./components/OrderTracker";
import AdminPanel    from "./components/AdminPanel";
import ProfileScreen from "./components/ProfileScreen";
import OrderHistory  from "./components/OrderHistory";
import "./App.css";

export default function App() {
  const [screen,    setScreen]    = useState("landing");
  const [user,      setUser]      = useState(null);
  const [cart,      setCart]      = useState({});
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("fb_user");
    if (saved) { setUser(JSON.parse(saved)); setScreen("menu"); }
  }, []);

  const handleAuth = (userData) => {
    setUser(userData);
    setScreen(userData.role === "admin" ? "admin" : "menu");
  };

  const handleLogout = () => {
    localStorage.removeItem("fb_user");
    setUser(null); setCart({}); setOrderData(null); setScreen("landing");
  };

  const handleUserUpdate = (updated) => { setUser(updated); };

  const addItem = (item) =>
    setCart(c => ({ ...c, [item.id]: { ...item, qty: (c[item.id]?.qty || 0) + 1 } }));

  const removeItem = (id) =>
    setCart(c => {
      const u = { ...c };
      if (u[id].qty > 1) u[id] = { ...u[id], qty: u[id].qty - 1 };
      else delete u[id];
      return u;
    });

  // Reorder: load items from history back into cart
  const handleReorder = (items) => {
    const newCart = {};
    items.forEach(item => {
      newCart[item.id] = { ...item, qty: item.qty };
    });
    setCart(newCart);
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const resetOrder = () => { setCart({}); setOrderData(null); setScreen("menu"); };

  return (
    <div className="app-root">
      {screen === "landing"  && <LandingPage  onLogin={() => setScreen("auth")} />}
      {screen === "auth"     && <AuthScreen   onBack={() => setScreen("landing")} onAuth={handleAuth} />}
      {screen === "menu"     && user && (
        <MenuScreen
          user={user} cart={cart} cartCount={cartCount} cartTotal={cartTotal}
          addItem={addItem} removeItem={removeItem}
          onCartClick={()   => setScreen("cart")}
          onAdminClick={()  => setScreen("admin")}
          onLogout={handleLogout}
          onProfileClick={() => setScreen("profile")}
        />
      )}
      {screen === "cart"     && user && (
        <CartScreen
          user={user} cartItems={cartItems} cartTotal={cartTotal}
          onBack={() => setScreen("menu")}
          onCheckout={(d) => { setOrderData(d); setScreen("payment"); }}
          addItem={addItem} removeItem={removeItem}
        />
      )}
      {screen === "payment"  && (
        <PaymentScreen orderData={orderData} onBack={() => setScreen("cart")} onSuccess={(d) => { setOrderData(d); setScreen("success"); }} />
      )}
      {screen === "success"  && (
        <SuccessScreen
          orderData={orderData}
          onNewOrder={resetOrder}
          onTrack={() => setScreen("tracker")}
        />
      )}
      {screen === "tracker"  && (
        <OrderTracker
          orderData={orderData}
          onNewOrder={resetOrder}
          onBack={() => setScreen("success")}
        />
      )}
      {screen === "admin"    && user && (
        <AdminPanel user={user} onBack={() => setScreen("menu")} onLogout={handleLogout} />
      )}
      {screen === "profile"  && user && (
        <ProfileScreen
          user={user}
          onBack={() => setScreen("menu")}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
          onReorder={(items) => { handleReorder(items); setScreen("cart"); }}
        />
      )}
      {screen === "history"  && user && (
        <OrderHistory
          user={user}
          onBack={() => setScreen("menu")}
          onReorder={(items) => { handleReorder(items); setScreen("cart"); }}
        />
      )}
    </div>
  );
}
