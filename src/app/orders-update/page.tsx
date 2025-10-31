"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function UpdateOrderStatusPage() {
  const [form, setForm] = useState({ orderId: "", status: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    
    if (res.ok) {
      toast.success("Update successful");
      setForm({ orderId: "", status: "" });
    } else {
      toast.error("Update failed");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md p-4 mx-auto">
      <Card >
        <CardHeader>
          <CardTitle>Update Order Statu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="orderId">Order ID</FieldLabel>
                <Input value={form.orderId} name="orderId" autoComplete="off" required onChange={handleChange} />
              </Field>
              <Field>
                <FieldLabel htmlFor="status">New Status</FieldLabel>
                <Input value={form.status} name="status" autoComplete="off" required onChange={handleChange} />
              </Field>
              <Field orientation="horizontal">
                <Button disabled={loading} type="submit" className='w-full'>Submit</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
