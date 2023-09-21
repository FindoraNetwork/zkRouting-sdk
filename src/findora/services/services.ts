import { TransactionBuilder } from 'findora-wallet-wasm/web';
import sleep from 'sleep-promise';

import { Sdk } from '_src/Sdk';
import { getLedger } from '_src/findora/ledger';
import { getOwnedSids, getUtxo, getOwnerMemo, getStateCommitment } from '_src/findora/apis/apis';
import { SdkError, ErrorCodes } from '_src/auth';

export const getOwnedUtxo = async (sid: number): Promise<any> => {
  const { response: utxoData, error: utxoDataError } = await getUtxo(sid);
  if (utxoDataError) {
    return { sid, error: utxoDataError };
  }
  const isBlindType = utxoData.utxo.record.asset_type?.Confidential ? true : false;
  const isBlindMount = utxoData.utxo.record.amount?.Confidential ? true : false;
  const { response: memoDataResult, error: memoDataError } = await getOwnerMemo(sid);
  if (memoDataError) {
    return { sid, error: memoDataError };
  }
  return { utxo: utxoData.utxo, sid, isBlindType, isBlindMount, ownerMemoData: memoDataResult };
}

export const waitUtxoEnough = async (
  publickey: string,
  length: number = 1,
  counter: number = 20,
): Promise<{ error?: SdkError; sids?: number[] }> => {
  const { blockTime } = Sdk.environment;
  let times = counter;
  let responseLength = 0;
  while (times > 0) {
    try {
      const utxos = await getOwnedSids(publickey);
      if (utxos.response?.length >= length) {
        return { sids: utxos.response };
      }
      if (utxos.error) {
        return { error: utxos.error as SdkError };
      }
      responseLength = utxos.response?.length ?? responseLength;
      times--;
    } catch (error) {
      times--;
    }
    await sleep(blockTime);
  }
  return {
    error: new SdkError({
      errorCode: ErrorCodes.NO_MATCHING_DATA_FOUND,
      data: { except: `${length} sids`, publickey },
    }),
  };
};

export const getTransactionBuilder = async (data?: string): Promise<TransactionBuilder> => {
  const ledger = await getLedger();
  try {
    if (data) {
      return ledger.TransactionBuilder.from_string(data);
    }
    const { response: stateCommitment, error } = await getStateCommitment();

    if (error) {
      throw new Error(error.message);
    }

    if (!stateCommitment) {
      throw new Error('Could not receive response from state commitement call');
    }

    const [_, height] = stateCommitment;
    const blockCount = BigInt(height);
    return ledger.TransactionBuilder.new(BigInt(blockCount));
  } catch (error) {
    throw new SdkError({ errorCode: ErrorCodes.API_GET_STATE_COMMITMENT_ERROR, message: error.message });
  }
};
