"use client";
import { useState } from "react";

export default function OrderModal({ data, onClose }: { data: any; onClose: () => void }) {
  const [form, setForm] = useState({
    buy_psbt: "",
    buy_sign_psbt: "",
    payment_id: "",
    invoice: "",
    buyer_address: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setMsg("下单成功");
      setTimeout(onClose, 1000);
    } else {
      setMsg("下单失败");
    }
  };

  return (
    <div className="order-modal-overlay">
      <form className="order-modal-form" onSubmit={handleSubmit}>
        <h3>下单</h3>
        <label>
          buy_psbt
          <input name="buy_psbt" placeholder="buy_psbt" value={form.buy_psbt} onChange={handleChange} required />
        </label>
        <label>
          buy_sign_psbt
          <input name="buy_sign_psbt" placeholder="buy_sign_psbt" value={form.buy_sign_psbt} onChange={handleChange} required />
        </label>
        <label>
          payment_id
          <input name="payment_id" placeholder="payment_id" value={form.payment_id} onChange={handleChange} required />
        </label>
        <label>
          invoice
          <input name="invoice" placeholder="invoice" value={form.invoice} onChange={handleChange} required />
        </label>
        <label>
          buyer_address
          <input name="buyer_address" placeholder="buyer_address" value={form.buyer_address} onChange={handleChange} required />
        </label>
        <label>
          status
          <input name="status" placeholder="status" value={form.status} onChange={handleChange} required />
        </label>
        <div className="order-modal-btns">
          <button type="submit" disabled={loading}>{loading ? "提交中..." : "下单"}</button>
          <button type="button" className="cancel-btn" onClick={onClose}>取消</button>
        </div>
        {msg && <div className="order-modal-msg">{msg}</div>}
      </form>
      <style jsx>{`
        .order-modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.25);
          display: grid;
          place-items: center;
          z-index: 1000;
          overflow-y: auto;
        }
        .order-modal-form {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.13);
          padding: 2.2rem 2rem 1.5rem 2rem;
          min-width: 340px;
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .order-modal-form h3 {
          text-align: center;
          color: #0070f3;
          margin-bottom: 0.5rem;
        }
        .order-modal-form label {
          display: flex;
          flex-direction: column;
          font-size: 1rem;
          color: #444;
        }
        .order-modal-form input {
          margin-top: 0.3rem;
          padding: 0.6rem 0.8rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 1rem;
          background: #fafbfc;
          transition: border 0.2s;
        }
        .order-modal-form input:focus {
          border: 1.5px solid #0070f3;
          outline: none;
        }
        .order-modal-btns {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .order-modal-form button {
          flex: 1;
          padding: 0.7rem 0;
          background: linear-gradient(90deg, #0070f3 60%, #3291ff 100%);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .order-modal-form button:disabled {
          background: #b2cdfa;
          cursor: not-allowed;
        }
        .cancel-btn {
          background: #eaeaea;
          color: #444;
        }
        .cancel-btn:hover {
          background: #f5bdbd;
          color: #a00;
        }
        .order-modal-msg {
          text-align: center;
          color: #0070f3;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
