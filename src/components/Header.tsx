import { useContext } from 'react';
import BitlightWalletSDK from '@bitlight/wallet-sdk';
import { formatAddress } from '../app/utils/util';
import AccountContext from '@/context/AccountContext';
import { Button } from './ui/button';

export default function Header() {
  const { address, setAddress } = useContext(AccountContext)!;

  const connectOrDisWallet = async () => {
    const sdk = new BitlightWalletSDK();

    if (address) {
      setAddress('');
      await sdk.disconnect();
      return;
    }

    const connected = await sdk.isConnected();
    if (!connected) {
      await sdk.connect();
    }

    const data = await sdk.getAddress();
    setAddress(data.address);
  };

  return (
    <header className='sticky z-10 top-0 bg-background shadow h-12 flex items-center justify-between px-4'>
      <div className='flex gap-x-4'>
        <a href='/'>Home</a>
        <a href='/sells'>Sell</a>
      </div>
      <div>
        <Button type='button' onClick={connectOrDisWallet}>
          {address ? formatAddress(address) : 'Connect Wallet'}
        </Button>
      </div>
    </header>
  );
}
