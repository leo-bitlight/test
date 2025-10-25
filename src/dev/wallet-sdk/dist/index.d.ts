declare global {
    interface Window {
        bitlight?: BitlightInjected;
    }
}
export type NetworkType = 'bitcoin' | 'testnet' | 'regtest';
export interface ConnectResult {
    address: string;
}
export interface SignResult {
    pubkey: string;
    sign: string;
}
export interface BitlightAccount {
    address: string;
    btc_pub: string;
    rgb_pub: string;
}
export interface BitlightAddress {
    address: string;
}
export interface PayjoinBuyPost {
    assets_name: string;
    ticker: string;
    precision: number;
    contract_id: string;
    receive_rgb_amount: string;
    sell_btc_address: string;
    sell_amount_sat: string;
    utxo: string;
    state?: string;
}
export interface PayjoinBuyResult {
    invoice: string;
    psbt: string;
    txid: string;
    error?: string;
    state?: string;
}
export interface PayjoinPost {
    invoice: string;
    sell_amount_sat: string;
    psbt: string;
    payment_id?: string;
    state?: string;
}
export interface PayjoinSignResult {
    psbt: string;
    txid: string;
    error?: string;
    state?: string;
}
export interface PayjoinBuyConfirmResult {
    psbt: string;
    error?: string;
    state?: string;
}
export interface PayjoinSellResult {
    psbt: string;
    payment_id: string;
    error?: string;
    state?: string;
}
export interface PayjoinSellConfirmResult {
    paid: boolean;
    txid: string;
    error?: string;
    state?: string;
}
export interface BitlightInjected {
    connect: () => Promise<ConnectResult>;
    disconnect: () => Promise<boolean>;
    getAccounts: () => Promise<BitlightAccount>;
    getAddress: () => Promise<BitlightAddress>;
    getNetwork: () => Promise<{
        network: NetworkType;
    }>;
    switchNetwork: (network: NetworkType) => Promise<{
        network: NetworkType;
    }>;
    signMessage: (message: string) => Promise<SignResult>;
    getVersion: () => Promise<{
        version: string;
    }>;
    getRgbUtxos: () => Promise<any[]>;
    payjoinBuy: (post: PayjoinBuyPost) => Promise<PayjoinBuyResult>;
    payjoinBuySign: (post: PayjoinPost) => Promise<PayjoinBuyConfirmResult>;
    payjoinSell: (post: PayjoinPost) => Promise<PayjoinSellResult>;
    payjoinSellSign: (post: PayjoinPost) => Promise<PayjoinSellConfirmResult>;
}
declare class BitlightWalletSDK {
    private wallet?;
    private injectedCheck?;
    constructor();
    private waitForInjection;
    private waitForWalletReady;
    isReady(): boolean;
    isConnected(): Promise<boolean>;
    connect(): Promise<ConnectResult>;
    disconnect(): Promise<boolean>;
    getAccounts(): Promise<BitlightAccount>;
    getAddress(): Promise<BitlightAddress>;
    getNetwork(): Promise<NetworkType>;
    switchNetwork(network: NetworkType): Promise<NetworkType>;
    signMessage(message: string): Promise<SignResult>;
    getVersion(): Promise<string>;
    getContractUtxo(contractId: string): Promise<string>;
    payjoinBuy(post: PayjoinBuyPost): Promise<PayjoinBuyResult>;
    payjoinBuyConfirm(post: PayjoinPost): Promise<PayjoinBuyConfirmResult>;
    payjoinSell(post: PayjoinPost): Promise<PayjoinSellResult>;
    payjoinSellConfirm(post: PayjoinPost): Promise<PayjoinSellConfirmResult>;
}
export default BitlightWalletSDK;
