import * as bech32ToBuffer from 'bech32-buffer';
import BigNumber from 'bignumber.js';

import { ContractContext as Erc20 } from '_src/evm/contracts/types/Erc20';
import { SdkError, ErrorCodes } from '_src/auth';

export const generateSeedString = (length: number = 32) => {
  let seed = '';
  const randomVals = new Uint8Array(length);
  window.crypto.getRandomValues(randomVals);
  randomVals.forEach(num => {
    const hex = num.toString(16);
    seed += hex.length === 1 ? `0${hex}` : hex;
  });
  return seed;
};

export const calculationDecimalsAmount = async (
  contract: Erc20,
  amount: string,
  type: 'toWei' | 'formWei',
): Promise<string> => {
  try {
    const erc20Decimals = await contract.methods.decimals().call();
    const ten = new BigNumber(10);
    const power = ten.exponentiatedBy(erc20Decimals);
    if (type === 'toWei') {
      return new BigNumber(amount).times(power).toString(10);
    }
    return new BigNumber(amount).div(power).toString(10);
  } catch (error) {
    throw new SdkError({
      errorCode: ErrorCodes.FAILED_TO_CALL_CONTRACT_FUNCTION,
      data: { function: 'decimals', amount },
      message: error.message
    });
  }
};

export const formatWasmErrorMessage = (error: string | Error) => {
  if (typeof error === 'string') {
    const match = error.match(/Caused By: (.*)/g);
    return match ? match.join(', ') : error;
  }
  return error.message;
};

export const fraAddressToHashAddress = (address: string) => {
  try {
    const result = bech32ToBuffer.decode(address).data;
    return '0x' + Buffer.from(result).toString('hex');
  } catch (error) {
    throw new SdkError({
      errorCode: ErrorCodes.FAILED_TO_CONVERT_FRA_ADDRESS,
      data: { address },
      message: error.message
    });
  }
};
