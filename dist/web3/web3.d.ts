export declare const getDefaultAccount: () => Promise<string>;
export declare const gasOptions: (params?: {}, gasLimitValue?: number) => Promise<{
    from: string;
    gasLimit: string;
}>;
export declare const createERCDepositData: (tokenId: number, senderAddress: string, tokenAmount: string, findoraTo: string) => string;
export declare const signature: (data: string, address: string) => Promise<string>;
export declare const sign: (data: string) => Promise<string>;
export declare const decrypted: (data: string) => Promise<FindoraWallet.IWalletWrap>;
export declare const createLowLevelData: (destinationChainId: string, tokenAmount: string, tokenId: string, recipientAddress: string, funcName: string) => Promise<string>;
export declare const getCurrentBalance: () => Promise<string>;
