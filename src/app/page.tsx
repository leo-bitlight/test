'use client';

import { useEffect, useState } from 'react';
import OrderModal from '../components/OrderModal';
import BitlightWalletSDK from '@bitlight/wallet-sdk';

export default function SellsListPage() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    loadList();
  }, [])

  const loadList = async () => {
    const res = await fetch("/api/listsells", {
      method: "GET",
    });
    const data = await res.json();
    setList(data);
  }

  return <SellsList sells={list} />;
}

function SellsList({ sells }: { sells: any[] }) {
  const [loading, setLoading] = useState(false);
  const [currentSellData, setCurrentSellData] = useState<any>(null);

  const buy = async (item: any) => {
    try {
      const sdk = new BitlightWalletSDK();
      const connected = await sdk.isConnected();
      if (!connected) {
        await sdk.connect();
      }

      // 调用钱包 buy todo
      const data = {
        sellId: item.id,
        assetId: item.assetId,
        buy_psbt: '',
        buy_sign_psbt: '',
        payment_id: '',
        invoice: '',
        buyer_address: '',
        status: '0'
      }

      console.log(data)
      setLoading(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert('下单成功');
      }

      setLoading(false);

    } catch(e) {
      console.log(e)
    }
  }


  return (
    <div className="sells-list-wrapper">
      <h2>资产列表</h2>
      <div className="table-container">
        <table className="sells-table">
          <thead>
            <tr>
              <th>资产ID</th>
              <th>名称</th>
              <th>价格</th>
              <th>数量</th>
              <th>卖家地址</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sells.map((item) => (
              <tr key={item.id}>
                <td>{item.assetId}</td>
                <td>{item.assetName}</td>
                <td>{item.sellPrice}</td>
                <td>{item.sellAmount}</td>
                <td>
                  <div style={{width: '260px'}}>
                    {item.sellerAddress}
                  </div>
                </td>
                <td>{item.status}</td>
                <td>
                  <button disabled={loading} type='button' className="order-btn" onClick={() => buy(item)}>Buy</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* {currentSellData && <OrderModal data={currentSellData} onClose={() => setCurrentSellData(null)} />} */}

      <style jsx>{`
        .sells-list-wrapper {
          max-width: 900px;
          margin: 2.5rem auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
          padding: 2rem 1.5rem 2.5rem 1.5rem;
        }
        .sells-list-wrapper h2 {
          text-align: center;
          color: #222;
          margin-bottom: 1.5rem;
        }
        .table-container {
          overflow-x: auto;
        }
        .sells-table {
          width: 100%;
          border-collapse: collapse;
          background: #fafbfc;
          border-radius: 8px;
          overflow: hidden;
          font-size: 1rem;
        }
        .sells-table th, .sells-table td {
          padding: 0.9rem 0.7rem;
          text-align: center;
        }
        .sells-table th {
          background: #f0f4fa;
          color: #0070f3;
          font-weight: 600;
          border-bottom: 2px solid #e0e7ef;
        }
        .sells-table tr {
          transition: background 0.2s;
        }
        .sells-table tbody tr:hover {
          background: #eaf4ff;
        }
        .sells-table td {
          border-bottom: 1px solid #e0e7ef;
        }
        .order-btn {
          padding: 0.5rem 1.1rem;
          background: linear-gradient(90deg, #0070f3 60%, #3291ff 100%);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .order-btn:disabled {
          background: #999;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
