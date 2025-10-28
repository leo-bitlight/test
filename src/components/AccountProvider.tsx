'use client'

import { useState } from "react"
import AccountContext from "@/context/AccountContext"

export default function AccountProvider(props: any) {
  const cached = localStorage.getItem('address')

  const [address, setAddress] = useState(cached || '')

  const setAddressAndCache = (addr: string) => {
    setAddress(addr)
    localStorage.setItem('address', addr)
  }

  return (
    <AccountContext.Provider value={{ address, setAddress: setAddressAndCache }}>{props.children}</AccountContext.Provider>
  )
}