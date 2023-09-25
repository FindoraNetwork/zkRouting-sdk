export declare function createWallet(privateStr?: string): Promise<FindoraWallet.IWallet>;
export declare const getWallet: (privateStr?: string) => Promise<FindoraWallet.IWalletWrap>;
export declare const getAXfrPublicKeyByBase64: (publicKey: string) => Promise<import("../../../findora-wallet-wasm/web/wasm").XfrPublicKey>;
export declare const getAXfrPrivateKeyByBase64: (privateKey: string) => Promise<import("../../../findora-wallet-wasm/web/wasm").XfrKeyPair>;
