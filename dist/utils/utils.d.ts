import { ContractContext as Erc20 } from '_src/evm/contracts/types/Erc20';
export declare const generateSeedString: (length?: number) => string;
export declare const calculationDecimalsAmount: (contract: Erc20, amount: string, type: 'toWei' | 'formWei') => Promise<string>;
export declare const formatWasmErrorMessage: (error: string | Error) => string;
export declare const fraAddressToHashAddress: (address: string) => string;
