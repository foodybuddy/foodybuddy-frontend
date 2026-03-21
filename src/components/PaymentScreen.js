import { useState } from "react";

const API   = process.env.REACT_APP_API_URL || "http://localhost:5000";
const STEPS = ["Processing payment...", "Verifying with Razorpay...", "Sending WhatsApp notification...", "Confirming order..."];
const METHODS = [
  { id:"upi",        label:"UPI / Google Pay / PhonePe" },
  { id:"card",       label:"Debit or Credit Card"       },
  { id:"netbanking", label:"Net Banking"                 },
];

export default function PaymentScreen({ orderData, onBack, onSuccess }) {
  const [method,     setMethod]     = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [stepIdx,    setStepIdx]    = useState(0);

  const handlePay = async () => {
    setProcessing(true);
    let i = 0;
    const iv = setInterval(() => { i++; setStepIdx(i); if (i >= STEPS.length - 1) clearInterval(iv); }, 900);

    try {
      const res = await fetch(`${API}/create-order`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(orderData)
      });
      const { order_id, amount, key_id } = await res.json();

      new window.Razorpay({
        key: key_id, amount, currency:"INR",
        name:"Foody Buddy", description:"Canteen Order", order_id,
        prefill: { name: orderData.name, contact:`+91${orderData.phone}` },
        theme: { color:"#D94F00" },
        handler: async (response) => {
          const verify = await fetch(`${API}/verify-payment`, {
            method:"POST", headers:{ "Content-Type":"application/json" },
            body: JSON.stringify({ ...response, ...orderData })
          });
          const result = await verify.json();
          clearInterval(iv);
          if (result.status === "success") onSuccess({ ...orderData, razorpay_order_id: order_id });
          else { alert("Payment verification failed. Please contact the canteen."); setProcessing(false); }
        },
        modal: { ondismiss: () => setProcessing(false) }
      }).open();
    } catch {
      alert("Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  if (processing) return (
    <div className="processing">
      <div className="spinner" />
      <div className="proc-label">{STEPS[stepIdx]}</div>
      <div className="proc-sub">Please keep this screen open</div>
    </div>
  );

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="screen-title">Payment</div>
      </div>
      <div className="screen-body">

        <div className="info-box">
          {orderData.items.map(i => (
            <div key={i.id} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", fontSize:13 }}>
              <span>{i.name} × {i.qty}</span><span>₹{i.price * i.qty}</span>
            </div>
          ))}
        </div>

        <div className="divider" />
        <div className="total-row" style={{ marginBottom:20 }}>
          <span className="total-label">Amount to Pay</span>
          <span className="total-val">₹{orderData.total}</span>
        </div>

        <div className="field-label" style={{ marginBottom:10 }}>Payment Method</div>
        {METHODS.map(m => (
          <div key={m.id} className={`pay-method ${method === m.id ? "active" : ""}`} onClick={() => setMethod(m.id)}>
            <div style={{ width:8, height:8, borderRadius:"50%", background: method === m.id ? "var(--primary)" : "var(--border)", flexShrink:0 }} />
            {m.label}
          </div>
        ))}

        <div style={{ marginTop:16 }}>
          <button className="btn-primary" onClick={handlePay}>Pay ₹{orderData.total}</button>
        </div>
        <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:"var(--mid)" }}>Secured by Razorpay</div>
      </div>
    </div>
  );
}
