'use client';

import { useContext, useEffect, useState } from 'react';
import BitlightWalletSDK from '../dev/wallet-sdk/src';
import AccountContext from '@/context/AccountContext';

const orderStatusMap: { [key: string]: string } = {
  '0': 'Waiting for transaction',
  '1': 'Buyer submitted, waiting for seller to complete the transaction',
  '2': 'Seller completed the transaction, waiting for the buyer to sign',
  '3': 'Buyer has signed, waiting for seller to sign',
  '4': 'Transaction successful',
  '5': 'Transaction failed',
};
const orderStatusOpMap: { [key: string]: string } = {
  '0': 'Waiting for transaction',
  '1': 'Send transaction',
  '2': 'Confirm transaction',
  '3': 'Confirm transaction',
  '4': 'Transaction successful',
  '5': 'Transaction failed',
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
  // const [currentSellData, setCurrentSellData] = useState<any>(null);
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
        alert('No available UTXOs');
        return;
      }

      const payjoinData = await sdk.payjoinBuy({
        assets_name: item.assetName,
        precision: item.precision,
        ticker: item.assetName,
        contract_id: item.assetId,
        receive_rgb_amount: item.sellAmount,
        sell_btc_address: item.sellerAddress,
        sell_amount_sat: item.sellPrice,
        utxo,
        state: item.id,
      });

      console.log('payjoinData', payjoinData);

      if (!payjoinData || !payjoinData.psbt) {
        alert('Failed to submit order');
        return;
      }

      const data = {
        sellId: item.id,
        assetId: item.assetId,
        assetName: item.assetName,
        precision: item.precision,
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
        alert('Order successfully placed, wait for the seller to process the order');
      }

      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleOrderOp = async (item: any) => {
    const sdk = new BitlightWalletSDK();
    const connected = await sdk.isConnected();
    if (!connected) {
      await sdk.connect();
    }
   
    setLoading(true);
    if (item.status === '1' && item.sell_address === address) {
      // Seller sends transaction
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
        alert('The transaction has been sent and is awaiting buyer confirmation');
        setLoading(false);
      }
    } else if (item.status === '2' && item.buyer_address === address) {
      // Buyer confirms transaction
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
        alert('Transaction confirmed, waiting for seller confirmation');
        setLoading(false);
      }
    } else if (item.status === '3' && item.sell_address === address) {
      // Buyer confirms transaction
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
        alert('The transaction has been confirmed and is awaiting confirmation from the blockchain network');
        setLoading(false);
      }
    } else {
      alert('The current state cannot be operated');
      setLoading(false);
    }
  };

  return (
    <div className='sells-list-wrapper'>
      <h2>Sell List</h2>
      <div className='table-container'>
        <table className='sells-table'>
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Asset Name</th>
              <th>Precision</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Seller Address</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sells.map((item) => (
              <tr key={item.id}>
                <td width={220}>{item.assetId}</td>
                <td>{item.assetName}</td>
                <td>{item.precision}</td>
                <td>{item.sellPrice} sat</td>
                <td>{item.sellAmount}</td>
                <td width={260}> {item.sellerAddress}</td>
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

      <h2 className='my-order'>My Orders</h2>

      {address && (
        <div className='table-container'>
          <table className='sells-table'>
            <thead>
              <tr>
                <th>Type</th>
                <th>Asset ID</th>
                <th>Asset Name</th>
                <th>Precision</th>
                <th>Price</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((item) => (
                <tr key={item.id}>
                  <td>{item.buyer_address === address ? 'Buy' : 'Sell'}</td>
                  <td width={220}>{item.assetId}</td>
                  <td>{item.assetName}</td>
                  <td>{item.precision}</td>
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
        .my-order {
          margin-top: 40px;
        }
      `}</style>
    </div>
  );
}
