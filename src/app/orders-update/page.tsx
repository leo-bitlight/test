"use client";
import { useState } from "react";

export default function UpdateOrderStatusPage() {
  const [form, setForm] = useState({ orderId: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setMsg("更新成功");
      setForm({ orderId: "", status: "" });
    } else {
      setMsg("更新失败");
    }
  };

  return (
    <div className="update-order-status-wrapper">
      <form className="update-order-status-form" onSubmit={handleSubmit}>
        <h2>更新订单状态</h2>
        <label>
          订单ID
          <input name="orderId" placeholder="订单ID" value={form.orderId} onChange={handleChange} required />
        </label>
        <label>
          新状态
          <input name="status" placeholder="新状态" value={form.status} onChange={handleChange} required />
          <div>
            0 等待交易，1已支付等待买家签名,2买家已签名等待支付,3已支付,4已广播，5交易成功，6交易失败
          </div>
        </label>
        <button type="submit" disabled={loading}>{loading ? "提交中..." : "更新"}</button>
        {msg && <div className="form-msg">{msg}</div>}
      </form>
      <style jsx>{`
        .update-order-status-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f8fa;
        }
        .update-order-status-form {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
          padding: 2.5rem 2rem 2rem 2rem;
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .update-order-status-form h2 {
          text-align: center;
          margin-bottom: 0.5rem;
          color: #222;
        }
        .update-order-status-form label {
          display: flex;
          flex-direction: column;
          font-size: 1rem;
          color: #444;
        }
        .update-order-status-form input {
          margin-top: 0.3rem;
          padding: 0.6rem 0.8rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 1rem;
          background: #fafbfc;
          transition: border 0.2s;
        }
        .update-order-status-form input:focus {
          border: 1px solid #0070f3;
          outline: none;
        }
        .update-order-status-form button {
          margin-top: 0.5rem;
          padding: 0.7rem 0;
          background: linear-gradient(90deg, #0070f3 60%, #3291ff 100%);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .update-order-status-form button:disabled {
          background: #b2cdfa;
          cursor: not-allowed;
        }
        .form-msg {
          text-align: center;
          color: #0070f3;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
