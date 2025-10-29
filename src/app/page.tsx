'use client';

import { useContext, useEffect, useState } from 'react';
import BitlightWalletSDK from '../dev/wallet-sdk/src';
import AccountContext from '@/context/AccountContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
        toast.error('No available UTXOs');
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
        toast.error('Failed to submit order');
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
        toast.error('Order successfully placed, wait for the seller to process the order');
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
        // @ts-expect-error add field
        precision: item.precision,
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
        toast.error('The transaction has been sent and is awaiting buyer confirmation');
        setLoading(false);
      }
    } else if (item.status === '2' && item.buyer_address === address) {
      // Buyer confirms transaction
      const res = await sdk.payjoinBuyConfirm({
        // @ts-expect-error add field
        precision: item.precision,
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
        toast.error('Transaction confirmed, waiting for seller confirmation');
        setLoading(false);
      }
    } else if (item.status === '3' && item.sell_address === address) {
      // Buyer confirms transaction
      const res = await sdk.payjoinSellConfirm({
        // @ts-expect-error add field
        precision: item.precision,
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
        toast.error('The transaction has been confirmed and is awaiting confirmation from the blockchain network');
        setLoading(false);
      }
    } else {
      toast.error('The current state cannot be operated');
      setLoading(false);
    }
  };

  return (
    <div className='mx-20'>
      <h2 className='pt-10 pb-2 font-bold'>Sell List</h2>
      <div className='border rounded'>
        <Table className='sells-table'>
          <TableHeader>
            <TableRow>
              <TableHead>Asset ID</TableHead>
              <TableHead>Asset Name</TableHead>
              <TableHead>Precision</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Seller Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sells.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className='max-w-[220px]'>{item.assetId}</div>
                </TableCell>
                <TableCell>{item.assetName}</TableCell>
                <TableCell>{item.precision}</TableCell>
                <TableCell>{item.sellPrice} sat</TableCell>
                <TableCell>{item.sellAmount}</TableCell>
                <TableCell>
                  <div className='max-w-[220px]'>
                    {item.sellerAddress}
                  </div>
                </TableCell>
                <TableCell>{orderStatusMap[item.status]}</TableCell>
                <TableCell>
                  <Button
                    disabled={loading || !address || item.status !== '0'}
                    type='button'
                    onClick={() => buy(item)}
                  >
                    Buy
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <h2 className='pt-10 pb-2 font-bold'>My Orders</h2>

      {address && (
        <div className='border rounded'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Asset ID</TableHead>
                <TableHead>Asset Name</TableHead>
                <TableHead>Precision</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.buyer_address === address ? 'Buy' : 'Sell'}</TableCell>
                  <TableCell>
                    <div className='max-w-[220px]'>
                      {item.assetId}
                    </div>
                  </TableCell>
                  <TableCell>{item.assetName}</TableCell>
                  <TableCell>{item.precision}</TableCell>
                  <TableCell>{item.sellPrice} sat</TableCell>
                  <TableCell>{item.sellAmount}</TableCell>

                  <TableCell>{orderStatusMap[item.status]}</TableCell>
                  <TableCell>
                    <Button
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
                      onClick={() => handleOrderOp(item)}
                    >
                      {orderStatusOpMap[item.status]}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
