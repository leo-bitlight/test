'use client';

import { useContext, useEffect, useState } from 'react';
import OrderModal from '../components/OrderModal';
import BitlightWalletSDK from '@bitlight/wallet-sdk';
import AccountContext from '@/context/AccountContext';
const orderStatusMap: { [key: string]: string } = {
  '0': '等待交易',
  '1': '买家已提交订单，等待卖家交易',
  '2': '卖家已交易，等待买家签名确认',
  '3': '买家已签名确认，等待卖家签名确认',
  '4': '交易成功',
  '5': '交易失败',
};
const orderStatusOpMap: { [key: string]: string } = {
  '0': '等待交易',
  '1': '发送交易',
  '2': '确认交易',
  '3': '确认交易',
  '4': '交易成功',
  '5': '交易失败',
};

export default function SellsListPage() {
  const { address } = useContext(AccountContext)!;
  const [list, setList] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [updateTimestamp, setUpdateTimestamp] = useState<number>(Date.now());
  useEffect(() => {
    loadList();
  }, [address, updateTimestamp]);

  const loadList = async () => {
    const res = await fetch('/api/listsells', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    const data = await res.json();
    setList(data.sells || []);
    setOrders(data.orders || []);
  };

  return (
    <SellsList
      sells={list}
      orders={orders}
      setUpdateTimestamp={setUpdateTimestamp}
    />
  );
}

function SellsList({
  sells,
  orders,
  setUpdateTimestamp,
}: {
  sells: any[];
  orders: any[];
  setUpdateTimestamp: (timestamp: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [currentSellData, setCurrentSellData] = useState<any>(null);
  const { address } = useContext(AccountContext)!;

  const buy = async (item: any) => {
    try {
      const sdk = new BitlightWalletSDK();
      const connected = await sdk.isConnected();
      if (!connected) {
        await sdk.connect();
      }
      const utxo = await sdk.getContractUtxo(item.assetId);
      if (!utxo) {
        alert('没有可用的UTXO进行支付');
        return;
      }

      const payjoinData = await sdk.payjoinBuy({
        assets_name: item.assetName,
        precision: 1,
        ticker: item.assetName,
        contract_id: item.assetId,
        receive_rgb_amount: item.sellAmount,
        sell_btc_address: item.sellerAddress,
        sell_amount_sat: item.sellPrice,
        utxo,
        state: item.id,
      });

      console.log('payjoinData', payjoinData);

      //0 等待交易，1买家已提交订单，等待卖家交易,2卖家已交易，等待买家签名确认,3买家已签名确认，等待卖家签名确认,4交易成功，5交易失败

      if (!payjoinData || !payjoinData.psbt) {
        alert('提交订单失败，请重试');
        return;
      }

      const data = {
        sellId: item.id,
        assetId: item.assetId,
        assetName: item.assetName,
        sellPrice: item.sellPrice,
        sellAmount: item.sellAmount,
        buy_psbt: payjoinData.psbt,
        invoice: payjoinData.invoice,
        buyer_address: address,
        sell_address: item.sellerAddress,
        status: '1',
      };

      console.log(data);
      setLoading(true);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setUpdateTimestamp(Date.now());
        alert('下单成功,请等待卖家处理订单');
      }

      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleOrderOp = async (item: any) => {
    console.log('order op', item);
    const sdk = new BitlightWalletSDK();
    const connected = await sdk.isConnected();
    if (!connected) {
      await sdk.connect();
    }
    //0 等待交易，1买家已提交订单，等待卖家交易,2卖家已交易，等待买家签名确认,3买家已签名确认，等待卖家签名确认,4交易成功，5交易失败
    setLoading(true);
    if (item.status === '1' && item.sell_address === address) {
      //卖家发送交易
      const res = await sdk.payjoinSell({
        psbt: item.buy_psbt,
        invoice: item.invoice,
        state: item.sellId,
        sell_amount_sat: item.sellPrice,
      });
      console.log('payjoinSell', res);
      if (res && res.payment_id) {
        await fetch('/api/orders/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: item.id,
            status: '2',
            payment_id: res.payment_id,
            sell_sign_psbt: res.psbt,
          }),
        });
        setUpdateTimestamp(Date.now());
        alert('交易已发送，等待买家确认');
        setLoading(false);
      }
    } else if (item.status === '2' && item.buyer_address === address) {
      //买家确认交易
      const res = await sdk.payjoinBuyConfirm({
        psbt: item.sell_sign_psbt,
        invoice: item.invoice,
        sell_amount_sat: item.sellPrice,
        state: item.sellId,
      });
      console.log('payjoinBuyerConfirm', res);
      if (res && res.psbt) {
        await fetch('/api/orders/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: item.id,
            status: '3',
            buy_sign_psbt: res.psbt,
          }),
        });
        setUpdateTimestamp(Date.now());
        alert('交易已确认，等待卖家确认');
        setLoading(false);
      }
    } else if (item.status === '3' && item.sell_address === address) {
      //买家确认交易
      const res = await sdk.payjoinSellConfirm({
        psbt: item.buy_sign_psbt,
        invoice: item.invoice,
        sell_amount_sat: item.sellPrice,
        payment_id: item.payment_id,
        state: item.sellId,
      });
      console.log('payjoinSellConfirm', res);
      if (res && res.paid) {
        await fetch('/api/orders/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: item.id,
            txid: res.txid,
            status: '4',
          }),
        });
        setUpdateTimestamp(Date.now());
        alert('交易已确认,等待区块链网络确认');
        setLoading(false);
      }
    } else {
      alert('当前状态无法操作');
      setLoading(false);
    }
  };

  return (
    <div className='sells-list-wrapper'>
      <h2>Sell列表</h2>
      <div className='table-container'>
        <table className='sells-table'>
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
                <td>{item.sellPrice} sat</td>
                <td>{item.sellAmount}</td>
                <td>
                  <div style={{ width: '260px' }}>{item.sellerAddress}</div>
                </td>
                <td>{orderStatusMap[item.status]}</td>
                <td>
                  <button
                    disabled={loading || !address || item.status !== '0'}
                    type='button'
                    className='order-btn'
                    onClick={() => buy(item)}
                  >
                    Buy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>我的订单</h2>

      {address && (
        <div className='table-container'>
          <table className='sells-table'>
            <thead>
              <tr>
                <th>类型</th>
                <th>资产ID</th>
                <th>名称</th>
                <th>价格</th>
                <th>数量</th>

                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((item) => (
                <tr key={item.id}>
                  <td>{item.buyer_address === address ? '买入' : '卖出'}</td>
                  <td>{item.assetId}</td>
                  <td>{item.assetName}</td>
                  <td>{item.sellPrice} sat</td>
                  <td>{item.sellAmount}</td>

                  <td>{orderStatusMap[item.status]}</td>
                  <td>
                    <button
                      disabled={
                        loading ||
                        !address ||
                        (item.buyer_address === address &&
                          item.status !== '2') ||
                        (item.sell_address === address &&
                          item.status !== '1' &&
                          item.status !== '3')
                      }
                      type='button'
                      className='order-btn'
                      onClick={() => handleOrderOp(item)}
                    >
                      {orderStatusOpMap[item.status]}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .sells-list-wrapper {
          min-width: 1000px;
          margin: 2.5rem auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
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
        .sells-table th,
        .sells-table td {
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
