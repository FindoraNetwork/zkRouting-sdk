import { TransactionBuilder } from 'findora-wallet-wasm/web';
import { SdkError } from '_src/auth';
export declare const getOwnedUtxo: (sid: number) => Promise<any>;
export declare const waitUtxoEnough: (publickey: string, length?: number, counter?: number) => Promise<{
    error?: SdkError;
    sids?: number[];
}>;
export declare const getTransactionBuilder: (data?: string) => Promise<TransactionBuilder>;
