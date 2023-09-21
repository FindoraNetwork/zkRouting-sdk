import * as Types from './types';
import { NetworkAxiosConfig } from '../../types/types';
export declare const getOwnedSids: (address: string, config?: NetworkAxiosConfig) => Promise<Types.OwnedSidsDataResult>;
export declare const getUtxo: (utxoSid: number, config?: NetworkAxiosConfig) => Promise<Types.UtxoDataResult>;
export declare const getOwnerMemo: (utxoSid: number, config?: NetworkAxiosConfig) => Promise<Types.OwnerMemoDataResult>;
export declare const getAbarOwnerMemo: (atxoSid: string, config?: NetworkAxiosConfig) => Promise<Types.OwnerMemoDataResult>;
export declare const getMTLeafInfo: (atxoSid: string, config?: NetworkAxiosConfig) => Promise<Types.MTLeafInfoDataResult>;
/**
 * Returns state commitment
 *
 * @remarks
 * An important property of a Findora ledger is the ability to authenticate transactions.
 * Users can authenticate transactions against a small tag called the state commitment.
 * The state commitment is a commitment to the current state of the ledger.
 * The state commitment response is a tuple containing the state commitment and the state commitment version.
 *
 *
 * @returns An instace of StateCommitmentDataResult
 */
export declare const getStateCommitment: (config?: NetworkAxiosConfig) => Promise<Types.StateCommitmentDataResult>;
export declare const submitTransaction: <T extends string>(data?: T, config?: NetworkAxiosConfig) => Promise<Types.SubmitTransactionDataResult>;
export declare const getAssetToken: (assetCode: string, config?: NetworkAxiosConfig) => Promise<Types.AssetTokenDataResult>;
export declare const getBlock: (height: number, config?: NetworkAxiosConfig) => Promise<Types.BlockDetailsDataResult>;
export declare const getHashSwap: (hash: string, config?: NetworkAxiosConfig) => Promise<Types.HashSwapDataResult>;
export declare const getTxList: (address: string, type: 'to' | 'from', page?: number, config?: NetworkAxiosConfig) => Promise<Types.TxListDataResult>;
export declare const getTransactionDetails: (hash: string, config?: NetworkAxiosConfig) => Promise<Types.TxDetailsDataResult>;
export declare const getAbciNoce: (data: string, config?: NetworkAxiosConfig) => Promise<Types.AbciNoceResult>;
export declare const getAbciInfo: (data: string, config?: NetworkAxiosConfig) => Promise<Types.AbciInfoResult>;
export declare const getOwnedAbars: (commitment: string, config?: NetworkAxiosConfig) => Promise<Types.OwnedAbarsDataResult>;
export declare const checkNullifierHashSpent: (hash: string, config?: NetworkAxiosConfig) => Promise<Types.CheckNullifierHashSpentDataResult>;
