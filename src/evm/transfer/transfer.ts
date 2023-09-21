import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'ethereum-abi-types-generator';

import * as contracts from '_src/evm/contracts';
import { gasOptions } from '_src/web3';
import { SendOptions as PrismBridgeSendOptions } from '_src/evm/contracts/types/PrismBridge';
import { SdkError, ErrorCodes } from '_src/auth';
import { fraAddressToHashAddress, calculationDecimalsAmount } from '_src/utils';

type fraToBarPayloadType = {
  bridgeAddress: string;
  recipientAddress: string;
  amount: string;
}

type frc20ToBarPayloadType = {
  bridgeAddress: string;
  recipientAddress: string;
  tokenAddress: string;
  tokenAmount: string;
}

export const fraToBar = async (payload: fraToBarPayloadType): Promise<TransactionReceipt> => {
  const {
    bridgeAddress,
    recipientAddress,
    amount,
  } = payload;
  const contract = contracts.prismBridge(bridgeAddress);
  const sendObj = {} as PrismBridgeSendOptions;
  const bar2abarFee = new BigNumber(0.02).times(10 ** 18);
  const convertFee = new BigNumber(0.01).times(10 ** 18);
  const convertAmount = new BigNumber(amount).times(10 ** 18);
  try {
    const options = await gasOptions();
    sendObj.from = options.from;
  } catch (error) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_ESTIMATE_GAS_FEE, message: error.message });
  }
  const findoraTo = fraAddressToHashAddress(recipientAddress);
  let txHash = '';

  let gas = 0;
  const bar2abarFeeValue = BigInt(bar2abarFee.toString(10)).toString();
  gas = await contract.methods.depositFRA(findoraTo).estimateGas({ from: sendObj.from, value: bar2abarFeeValue });
  await contract.methods.depositFRA(findoraTo).send({ from: sendObj.from, value: bar2abarFeeValue, gas });

  const convertFeeValue = BigInt(convertFee.toString(10)).toString();
  gas = await contract.methods.depositFRA(findoraTo).estimateGas({ from: sendObj.from, value: convertFeeValue });
  await contract.methods.depositFRA(findoraTo).send({ from: sendObj.from, value: convertFeeValue, gas });

  const amountValue = BigInt(convertAmount.toString(10)).toString();
  gas = await contract.methods.depositFRA(findoraTo).estimateGas({ from: sendObj.from, value: amountValue });
  return new Promise((resolve, reject) => {
    contract.methods
      .depositFRA(findoraTo)
      .send({ from: sendObj.from, value: amountValue, gas })
      .once('transactionHash', (hash) => { txHash = hash; })
      .once('receipt', (receipt) => { resolve(receipt); })
      .once('error', (error) => {
        if (txHash) {
          resolve({ transactionHash: txHash } as any);
        } else {
          const errorCode = error.message.includes('Transaction was not mined within')
            ? ErrorCodes.TRANSACTION_IN_STUCK_ERROR
            : ErrorCodes.FAILED_TO_CALL_CONTRACT_FUNCTION;
          reject(new SdkError({
            errorCode,
            data: { function: 'depositFRA', txHash },
            message: error.message
          }))
        }
      })
  });
};

export const frc20ToBar = async (payload: frc20ToBarPayloadType): Promise<TransactionReceipt | Partial<TransactionReceipt>> => {
  const {
    bridgeAddress,
    recipientAddress,
    tokenAddress,
    tokenAmount,
  } = payload;
  const contract = contracts.prismBridge(bridgeAddress);
  const erc20Contract = contracts.erc20(tokenAddress);
  const sendObj = {} as PrismBridgeSendOptions;
  const bar2abarFee = new BigNumber(0.02).times(10 ** 18);
  const convertFee = new BigNumber(0.01).times(10 ** 18);

  const amount = await calculationDecimalsAmount(erc20Contract, tokenAmount, 'toWei');
  try {
    const options = await gasOptions();
    sendObj.from = options.from;
  } catch (error) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_ESTIMATE_GAS_FEE, message: error.message });
  }
  const findoraTo = fraAddressToHashAddress(recipientAddress);
  let txHash = '';

  let gas = 0;
  const bar2abarFeeValue = BigInt(bar2abarFee.toString(10)).toString();
  gas = await contract.methods.depositFRA(findoraTo).estimateGas({ from: sendObj.from, value: bar2abarFeeValue });
  await contract.methods.depositFRA(findoraTo).send({ from: sendObj.from, value: bar2abarFeeValue, gas });

  const convertFeeValue = BigInt(convertFee.toString(10)).toString();
  gas = await contract.methods.depositFRA(findoraTo).estimateGas({ from: sendObj.from, value: convertFeeValue });
  await contract.methods.depositFRA(findoraTo).send({ from: sendObj.from, value: convertFeeValue, gas });

  gas = await contract.methods.depositFRC20(tokenAddress, findoraTo, amount).estimateGas(sendObj);
  return new Promise((resolve, reject) => {
    contract.methods
      .depositFRC20(tokenAddress, findoraTo, amount)
      .send({ ...sendObj, gas })
      .once('transactionHash', (hash) => { txHash = hash; })
      .once('receipt', (receipt) => { resolve(receipt); })
      .once('error', (error) => {
        if (txHash) {
          resolve({ transactionHash: txHash });
        } else {
          reject(new SdkError({
            errorCode: ErrorCodes.FAILED_TO_CALL_CONTRACT_FUNCTION,
            data: { function: 'depositFRC20', txHash },
            message: error.message
          }))
        }
      })
  });
};
