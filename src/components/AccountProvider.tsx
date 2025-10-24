'use client'

import { useEffect, useState } from "react"
import AccountContext from "@/context/AccountContext"

export default function AccountProvider(props: any) {
  const [address, setAddress] = useState('')

  const setAddressAndCache = (addr: string) => {
    setAddress(addr)
    localStorage.setItem('address', addr)
  }

  useEffect(() => {
    const cached = localStorage.getItem('address')
    if(cached) {
      setAddress(cached)
    }
  }, [])

  return (
    <AccountContext.Provider value={{ address, setAddress: setAddressAndCache }}>{props.children}</AccountContext.Provider>
  )
}