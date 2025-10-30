'use client';

import { useContext, useEffect, useState } from 'react';
import AccountContext from '@/context/AccountContext';
import SDK from '@bitlight/wallet-sdk'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SellForm() {
  const { address } = useContext(AccountContext)!;
  const [form, setForm] = useState({
    assetId: '',
    assetName: '',
    precision: '',
    sellPrice: '',
    sellAmount: '',
    sellerAddress: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({ ...form, sellerAddress: address });
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const loadDetail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value;
    if(!id) {
      return
    }

    setForm({ ...form, [e.target.name]: e.target.value });

    try {
      const sdk = new SDK();
      const network = await sdk.getNetwork()
      const res = await fetch('/api/asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: e.target.value,
          network: network,
        }),
      });
      const json = await res.json()
      const info = json.assets.length > 0 ? json.assets[0] : null;
      if(!info) {
        toast.error('Asset not found');
        return
      }

      setForm({
        ...form,
        assetName: info.name,
        precision: info.precision,
      });
    } catch (error) {
      console.error('Error fetching network:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const res = await fetch('/api/sells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('Successfully published');
        setForm({
          assetId: '',
          assetName: '',
          precision: '',
          sellPrice: '',
          sellAmount: '',
          sellerAddress: '',
        });
      } else {
        toast.error('Failed to publish');
      }

      setLoading(false);
    } catch(e) {
      console.log(e)
    }
  };

  return (
    <div className="max-w-xl p-4 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Sell Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Asset ID</FieldLabel>
                <Input name="assetId" autoComplete="off" required onChange={loadDetail} />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Asset Name</FieldLabel>
                <Input value={form.assetName} name="assetName" autoComplete="off" onChange={handleChange} />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Asset Precision</FieldLabel>
                <Input value={form.precision} name="precision" autoComplete="off" onChange={handleChange} />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Sell Price (sats)</FieldLabel>
                <Input value={form.sellPrice} name="sellPrice" autoComplete="off" onChange={handleChange} />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Sell Amount</FieldLabel>
                <Input value={form.sellAmount} name="sellAmount" autoComplete="off" onChange={handleChange} />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Seller Address</FieldLabel>
                <Input disabled value={form.sellerAddress} name="sellerAddress" autoComplete="off"  />
              </Field>

              <Field orientation="horizontal">
                <Button disabled={loading || !address} type="submit" className='w-full'>Submit</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
