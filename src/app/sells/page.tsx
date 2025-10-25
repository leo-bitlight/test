'use client';
import { useContext, useEffect, useState } from 'react';
import BitlightWalletSDK from '@bitlight/wallet-sdk';
import AccountContext from '@/context/AccountContext';

export default function SellForm() {
  const { address } = useContext(AccountContext)!;
  const [form, setForm] = useState({
    assetId: '',
    assetName: '',
    sellPrice: '',
    sellAmount: '',
    sellerAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setForm({ ...form, sellerAddress: address });
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // console.log(form)
    // return

    const res = await fetch('/api/sells', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setMsg('发布成功');
      setForm({
        assetId: '',
        assetName: '',
        sellPrice: '',
        sellAmount: '',
        sellerAddress: '',
      });
    } else {
      setMsg('发布失败');
    }
  };

  return (
    <div className='sell-form-wrapper'>
      <form className='sell-form' onSubmit={handleSubmit}>
        <h2>发布资产</h2>
        <label>
          资产ID
          <input
            name='assetId'
            placeholder='资产ID'
            value={form.assetId}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          资产名称
          <input
            name='assetName'
            placeholder='资产名称'
            value={form.assetName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          出售价格(sat)
          <input
            name='sellPrice'
            placeholder='出售价格(sat)'
            value={form.sellPrice}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          出售数量
          <input
            name='sellAmount'
            placeholder='出售数量'
            value={form.sellAmount}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          卖家地址
          <input
            disabled
            name='sellerAddress'
            placeholder='卖家地址'
            value={form.sellerAddress}
            required
          />
        </label>
        {/* <label>
          状态
          <input name="status" placeholder="状态" value={form.status} onChange={handleChange} required />
        </label> */}
        <button type='submit' disabled={loading || !address}>
          {loading ? '提交中...' : '发布'}
        </button>

        {msg && <div className='form-msg'>{msg}</div>}
      </form>
      <style jsx>{`
        .sell-form-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f8fa;
        }
        .sell-form {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
          padding: 2.5rem 2rem 2rem 2rem;
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .sell-form h2 {
          text-align: center;
          margin-bottom: 0.5rem;
          color: #222;
        }
        .sell-form label {
          display: flex;
          flex-direction: column;
          font-size: 1rem;
          color: #444;
        }
        .sell-form input {
          margin-top: 0.3rem;
          padding: 0.6rem 0.8rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 1rem;
          background: #fafbfc;
          outline: none;
        }
        .sell-form input:hover {
          border: 1px solid #0070f3;
        }
        .sell-form button {
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
        .sell-form button:disabled {
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
