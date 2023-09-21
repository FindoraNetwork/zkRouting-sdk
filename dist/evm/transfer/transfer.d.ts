import { TransactionReceipt } from 'ethereum-abi-types-generator';
type fraToBarPayloadType = {
    bridgeAddress: string;
    recipientAddress: string;
    amount: string;
};
type frc20ToBarPayloadType = {
    bridgeAddress: string;
    recipientAddress: string;
    tokenAddress: string;
    tokenAmount: string;
};
export declare const fraToBar: (payload: fraToBarPayloadType) => Promise<TransactionReceipt>;
export declare const frc20ToBar: (payload: frc20ToBarPayloadType) => Promise<TransactionReceipt | Partial<TransactionReceipt>>;
export {};
