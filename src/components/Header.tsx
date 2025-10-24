import { useContext, useEffect } from 'react';
import BitlightWalletSDK from '@bitlight/wallet-sdk';
import { formatAddress } from "../app/utils/util"
import AccountContext from '@/context/AccountContext';

export default function Header() {
  const {address, setAddress} = useContext(AccountContext)!

  const connectOrDisWallet = async () => {
    const sdk = new BitlightWalletSDK();

    if(address) {
      await sdk.disconnect();
      setAddress('')
      return
    }

    const connected = await sdk.isConnected();
    if (!connected) {
      await sdk.connect();
    }

    const data = await sdk.getAddress();
    setAddress(data.address)
  }

  return (
    <header style={{height: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div className="header-nav-left">
        <a href="/">首页</a>
        <a href="/sells">出售资产</a>
        <a href="/orders-update">测试更新订单状态</a>
      </div>
      <div>
        <button type="button" className="t-btn" onClick={connectOrDisWallet}>
          {address ? formatAddress(address) : 'Connect Wallet'}
        </button>
      </div>
    </header>
  )
}