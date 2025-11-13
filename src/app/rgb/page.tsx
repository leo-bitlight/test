'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import AccountContext from "@/context/AccountContext";
import { useContext, useEffect, useRef, useState } from "react";
import SDK from '@bitlight/wallet-sdk'
import { toast } from "sonner";

export default function RGB() {
  const [loading, setLoading] = useState(false);
  const { address } = useContext(AccountContext)!;
  const sdkRef = useRef<any>(null)

  useEffect(() => {
    if(sdkRef.current === null) {
      sdkRef.current = new SDK()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const invoice = formData.get('invoice') as string;

    try {
      const result = await sdkRef.current!.sendRGB({
        invoice
      })
      console.log(result)
    } catch(e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="max-w-xl p-4 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Send RGB Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="to">Invoice</FieldLabel>
                <Input name="invoice" autoComplete="off" required />
              </Field>
              

              <Field orientation="horizontal">
                <Button disabled={loading || !address} type="submit" className='w-full'>Send</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}