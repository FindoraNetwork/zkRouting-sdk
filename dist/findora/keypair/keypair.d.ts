export declare const genAnonKeys: () => Promise<FindoraWallet.IAnonWallet>;
export declare function createWallet(privateStr?: string): Promise<FindoraWallet.IWallet>;
export declare const getWallet: (privateStr?: string) => Promise<FindoraWallet.IWalletWrap>;
export declare const getAXfrPublicKeyByBase64: (publicKey: string) => Promise<import("../../../findora-wallet-wasm/web/wasm").AXfrPubKey>;
export declare const getAXfrPrivateKeyByBase64: (privateKey: string) => Promise<import("../../../findora-wallet-wasm/web/wasm").AXfrKeyPair>;
export declare const getAXfrViewKeyByBase64: (privateKey: string) => Promise<import("../../../findora-wallet-wasm/web/wasm").AXfrViewKey>;
