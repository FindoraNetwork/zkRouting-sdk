import sleep from 'sleep-promise';
import JSONbig from 'json-bigint';

import { Sdk } from '_src/Sdk';
import { apiGet, apiPost } from '_src/api';
import { SdkError, ErrorCodes } from '_src/auth';
import { getLedger } from '_src/findora/ledger';
import * as Types from './types';
import { NetworkAxiosConfig, DataResult } from '../../types/types';

const getQueryRoute = (): string => {
  const { hostUrl, queryPort } = Sdk.environment;

  const url = `${hostUrl}:${queryPort}`;

  return url;
};

const getSubmitRoute = (): string => {
  const { hostUrl, submissionPort } = Sdk.environment;

  const url = `${hostUrl}:${submissionPort}`;

  return url;
};

const getLedgerRoute = (): string => {
  const { hostUrl, ledgerPort } = Sdk.environment;

  const url = `${hostUrl}:${ledgerPort}`;

  return url;
};

const getExplorerApiRoute = (): string => {
  const { hostUrl, explorerApiPort } = Sdk.environment;

  const url = `${hostUrl}:${explorerApiPort}`;

  return url;
};

const getSubmitTransactionData = <T extends Types.TransactionData>(data?: T): DataResult => {
  let txData;

  if (!data) {
    return { response: txData };
  }

  try {
    txData = JSONbig.parse(data);
    return { response: txData };
  } catch (err) {
    const e: Error = err as Error;

    return { error: { message: `Can't submit transaction. Can't parse transaction data. ${e.message}` } };
  }
};

export const getOwnedSids = async (
  address: string,
  config?: NetworkAxiosConfig,
): Promise<Types.OwnedSidsDataResult> => {
  const url = `${getQueryRoute()}/get_owned_utxos/${address}`;

  const dataResult = await apiGet(url, config);

  const { response, error } = dataResult;

  if (error) {
    return {
      error: new SdkError({
        errorCode: ErrorCodes.API_GET_SIDS_ERROR,
        message: error.message,
      }),
    };
  }

  if (Array.isArray(response)) {
    return { response };
  }

  if (parseFloat(response) > 0) {
    return { response: [response] };
  }

  return { response: [] };
};

export const getUtxo = async (utxoSid: number, config?: NetworkAxiosConfig): Promise<Types.UtxoDataResult> => {
  const url = `${getLedgerRoute()}/utxo_sid/${utxoSid}`;

  const dataResult = await apiGet(url, config);

  return dataResult;
};

export const getOwnerMemo = async (
  utxoSid: number,
  config?: NetworkAxiosConfig,
): Promise<Types.OwnerMemoDataResult> => {
  const url = `${getQueryRoute()}/get_owner_memo/${utxoSid}`;

  const dataResult = await apiGet(url, config);

  return dataResult;
};

export const getAbarOwnerMemo = async (
  atxoSid: string,
  config?: NetworkAxiosConfig,
): Promise<Types.OwnerMemoDataResult> => {
  const url = `${getQueryRoute()}/get_abar_memo/${atxoSid}`;

  const dataResult = await apiGet(url, config);

  return dataResult;
};

export const getMTLeafInfo = async (
  atxoSid: string,
  config?: NetworkAxiosConfig,
): Promise<Types.MTLeafInfoDataResult> => {
  const url = `${getQueryRoute()}/get_abar_proof/${atxoSid}`;

  const dataResult = await apiGet(url, config);

  return dataResult;
};

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
export const getStateCommitment = async (
  config?: NetworkAxiosConfig,
): Promise<Types.StateCommitmentDataResult> => {
  const url = `${getLedgerRoute()}/global_state`;

  const dataResult = await apiGet(url, config);

  return dataResult;
};

export const submitTransaction = async <T extends Types.TransactionData>(
  data?: T,
  config?: NetworkAxiosConfig,
): Promise<Types.SubmitTransactionDataResult> => {
  const url = `${getSubmitRoute()}/submit_transaction`;

  const { response: txData, error } = getSubmitTransactionData(data);

  if (error) {
    return { error };
  }
  return await apiPost(url, txData, config);
};

export const getAssetToken = async (
  assetCode: string,
  config?: NetworkAxiosConfig,
): Promise<Types.AssetTokenDataResult> => {
  const url = `${getLedgerRoute()}/asset_token/${assetCode}`;

  const dataResult = await apiGet(url, config);

  return dataResult;
};

export const getBlock = async (
  height: number,
  config?: NetworkAxiosConfig,
): Promise<Types.BlockDetailsDataResult> => {
  const url = `${getExplorerApiRoute()}/block`;

  const dataResult = await apiGet(url, { ...config, params: { height } });

  return dataResult;
};

export const getHashSwap = async (
  hash: string,
  config?: NetworkAxiosConfig,
): Promise<Types.HashSwapDataResult> => {
  const url = `${getExplorerApiRoute()}/tx_search`;
  const { apiRetryDelay } = Sdk.environment;

  try {
    let dataResult = await apiGet(url, { ...config, params: { query: `"tx.prehash='${hash}'"` } });

    while (dataResult.response.result.txs?.length <= 0) {
      await sleep(apiRetryDelay);
      dataResult = await apiGet(url, { ...config, params: { query: `"tx.prehash='${hash}'"` } });
    }

    return dataResult;
  } catch (error) {
    return { error };
  }
};

export const getTxList = async (
  address: string,
  type: 'to' | 'from',
  page = 1,
  config?: NetworkAxiosConfig,
): Promise<Types.TxListDataResult> => {
  const url = `${getExplorerApiRoute()}/tx_search`;

  const query = type === 'from' ? `"addr.from.${address}='y'"` : `"addr.to.${address}='y'"`;

  const params = {
    query,
    page,
    per_page: 10,
    order_by: '"desc"',
  };

  const dataResult = await apiGet(url, { ...config, params });

  return dataResult;
};

export const getTransactionDetails = async (
  hash: string,
  config?: NetworkAxiosConfig,
): Promise<Types.TxDetailsDataResult> => {
  const params = {
    hash: `0x${hash}`,
  };
  const url = `${getExplorerApiRoute()}/tx`;

  const dataResult = await apiGet(url, { ...config, params });

  return dataResult;
};

export const getAbciNoce = async (data: string, config?: NetworkAxiosConfig): Promise<Types.AbciNoceResult> => {
  const ledger = await getLedger();
  const ethAddressJson = ledger.get_serialized_address(data);
  const url = `${getExplorerApiRoute()}/abci_query`;
  const params = {
    path: '"module/account/nonce"',
    data: `"${ethAddressJson}"`,
    prove: false,
  };
  const dataResult = await apiGet(url, { ...config, params });
  return dataResult;
};

export const getAbciInfo = async (data: string, config?: NetworkAxiosConfig): Promise<Types.AbciInfoResult> => {
  const ledger = await getLedger();
  const ethAddressJson = ledger.get_serialized_address(data);
  const url = `${getExplorerApiRoute()}/abci_query`;
  const params = {
    path: '"module/account/info"',
    data: `"${ethAddressJson}"`,
    prove: false,
  };
  const dataResult = await apiGet(url, { ...config, params });
  return dataResult;
};

export const getOwnedAbars = async (
  commitment: string,
  config?: NetworkAxiosConfig,
): Promise<Types.OwnedAbarsDataResult> => {
  const url = `${getQueryRoute()}/owned_abars/${commitment}`;

  const dataResult = await apiGet(url, config);
  return dataResult;
};

export const checkNullifierHashSpent = async (
  hash: string,
  config?: NetworkAxiosConfig,
): Promise<Types.CheckNullifierHashSpentDataResult> => {
  const url = `${getQueryRoute()}/check_nullifier_hash/${hash}`;

  const dataResult = await apiGet(url, config);

  return dataResult;
};
