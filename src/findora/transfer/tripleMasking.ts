import sleep from 'sleep-promise';

import { Sdk } from '_src/Sdk';
import { getAXfrPrivateKeyByBase64, getAXfrViewKeyByBase64, getAXfrPublicKeyByBase64 } from '_src/findora/keypair/keypair';
import { getOwnedAbars, submitTransaction, getHashSwap, getAbarOwnerMemo, getMTLeafInfo } from '_src/findora/apis/apis';
import { getOwnedUtxo, getTransactionBuilder } from '_src/findora/services/services';
import { getLedger } from '_src/findora/ledger';
import { formatWasmErrorMessage } from '_src/utils';
import { SdkError, ErrorCodes } from '_src/auth';

const getAnonKeypairFromJson = async (anonKeys: FindoraWallet.IAnonWallet) => {
  const { axfrSpendKey, axfrPublicKey, axfrViewKey } = anonKeys;
  const [axfrSpendKeyConverted, axfrViewKeyConverted, axfrPublicKeyConverted] = await Promise.all([
    getAXfrPrivateKeyByBase64(axfrSpendKey), // AXfrSpendKey
    getAXfrViewKeyByBase64(axfrViewKey), // AxfrViewKey
    getAXfrPublicKeyByBase64(axfrPublicKey), // AXfrPubKey
  ]);
  return {
    axfrSpendKeyConverted,
    axfrPublicKeyConverted,
    axfrViewKeyConverted,
  };
};

const getOwnedAbar = async (commitment: string) => {
  try {
    const { response: ownedAbarsResponse, error: ownedAbarError } = await getOwnedAbars(commitment);

    if (ownedAbarError) {
      throw new Error(ownedAbarError.message);
    }
    if (!ownedAbarsResponse) {
      throw new Error('Could not receive response from get ownedAbars call');
    }

    const [atxoSid, ownedAbar] = ownedAbarsResponse;
    return {
      commitment,
      abarData: {
        atxoSid,
        ownedAbar: { ...ownedAbar },
      },
    };
  } catch (error) {
    throw new SdkError({ errorCode: ErrorCodes.API_GET_OWNED_ABAR_ERROR, message: (error as Error).message });
  }
};

const findFeeSid = async (sids: number[], feeAmount: BigInt): Promise<{ sid?: number; error?: Error }> => {
  const ledger = await getLedger();
  const fra = ledger.fra_get_asset_code();
  for (const sid of sids) {
    const { utxo } = await getOwnedUtxo(sid);
    const assetType = ledger.asset_type_from_jsvalue(utxo.record.asset_type['NonConfidential']);
    const assetAmount = utxo.record.amount['NonConfidential'];
    if (assetType === fra && BigInt(assetAmount) === feeAmount) {
      return { sid };
    }
  }
  return { error: new Error(`Could not find a sid which the amount equal to ${feeAmount}`) };
};

export const barToAbar = async (data: FindoraWallet.IWalletWrap, sids = []) => {
  const ledger = await getLedger();
  const { walletStart, anonWallet, seeds } = data;
  const abarSeeds = [...seeds];
  let transactionBuilder = await getTransactionBuilder();

  let keypair;
  try {
    keypair = ledger.keypair_from_str(walletStart.keyStore as string);
  } catch (error) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_KEYPAIR_FROM_STRING });
  }

  let barToAbarFee;
  try {
    barToAbarFee = ledger.fra_get_minimal_fee_for_bar_to_abar();
  } catch (error) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_GET_MINIMAL_FEE });
  }

  const { sid: feeSid, error: getFeeSidError } = await findFeeSid(sids, barToAbarFee);
  if (getFeeSidError) {
    throw new SdkError({
      errorCode: ErrorCodes.NO_MATCHING_DATA_FOUND,
      message: getFeeSidError.message,
      data: { sids, barToAbarFee },
    });
  }

  const utxos = await Promise.all(sids.map(getOwnedUtxo));
  for (const utxoItem of utxos) {
    const { utxo, ownerMemoData, sid, error } = utxoItem;
    console.log('utxo data = ', utxo, ownerMemoData);

    if (error) {
      throw new SdkError({
        errorCode: ErrorCodes.API_GET_UTXO_ERROR,
        data: { sid },
        message: error.message,
      });
    }

    let ownerMemo;
    let assetRecord;
    try {
      ownerMemo = ownerMemoData ? ledger.AxfrOwnerMemo.from_json(ownerMemoData) : null;
    } catch (error) {
      throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_OWNER_MEMO_FROM_JSON });
    }

    try {
      assetRecord = ledger.ClientAssetRecord.from_json(utxo);
    } catch (error) {
      throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_CLIENT_ASSET_RECORD_FROM_JSON });
    }

    const { axfrPublicKeyConverted: axfrPublicKey } = await getAnonKeypairFromJson(anonWallet);

    if (sid === feeSid) {
      try {
        let feeInputs = ledger.FeeInputs.new();
        const feeAmount = BigInt(utxo.record.amount['NonConfidential']);
        const txoRef = ledger.TxoRef.absolute(BigInt(feeSid));
        feeInputs = feeInputs.append2(feeAmount, txoRef, assetRecord, ownerMemo?.clone(), keypair);
        transactionBuilder = transactionBuilder.add_fee_bar_to_abar(feeInputs);
      } catch (error) {
        throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_ADD_FEE_BAR2ABAR });
      }
    } else {
      try {
        transactionBuilder = transactionBuilder.add_operation_bar_to_abar(
          abarSeeds.shift(),
          keypair,
          axfrPublicKey,
          BigInt(sid),
          assetRecord,
          ownerMemo?.clone(),
        );
      } catch (error) {
        throw new SdkError({
          errorCode: ErrorCodes.FAILED_TO_ADD_OPERATION_BAR2ABAR,
          message: formatWasmErrorMessage(error),
        });
      }
    }
  }
  // console.log('add_operation_bar_to_abar = ', transactionBuilder.transaction());

  let commitments: { commitments: string[] };
  try {
    commitments = transactionBuilder?.get_commitments();
  } catch (error) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_GET_COMMITMENTS, message: formatWasmErrorMessage(error) });
  }

  if (!commitments?.commitments?.length) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_GET_COMMITMENTS });
  }

  try {
    transactionBuilder = transactionBuilder.build();
    transactionBuilder = transactionBuilder.sign(keypair);
  } catch (error) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_BUILD_TRANSACTION });
  }

  const { response: submitHandle, error: handleError } = await submitTransaction(transactionBuilder.transaction());

  if (handleError) {
    throw new SdkError({ errorCode: ErrorCodes.API_SUBMIT_TRANSACTION_ERROR, message: handleError.message });
  }

  if (!submitHandle) {
    throw new SdkError({ errorCode: ErrorCodes.API_SUBMIT_TRANSACTION_ERROR });
  }

  const { blockTime } = Sdk.environment;
  await sleep(blockTime);

  const { response: txnResponse, error: hashError } = await getHashSwap(submitHandle);

  if (hashError) {
    throw new SdkError({ errorCode: ErrorCodes.API_SEARCH_TRANSACTION_ERROR, message: hashError.message });
  }

  if (!txnResponse) {
    throw new SdkError({ errorCode: ErrorCodes.API_SEARCH_TRANSACTION_ERROR });
  }

  const { hash: txnHash, tx_result: txResult } = txnResponse.result.txs[0] || {};

  return {
    sids,
    commitments: commitments.commitments,
    txnHash,
    txnLog: txResult?.log,
  };
};

export const abarToBar = async (
  sender: FindoraWallet.IAnonWallet,
  receiver: FindoraWallet.IWallet,
  commitments: string[],
) => {
  const ledger = await getLedger();
  const { axfrSpendKeyConverted: aXfrSpendKeySender } = await getAnonKeypairFromJson(sender);

  let transactionBuilder = await getTransactionBuilder();

  const ownedAbarToUseAsSources = await Promise.all(commitments.map(getOwnedAbar));

  // add_operation_abar_to_bar
  for (const ownedAbarToUseAsSource of ownedAbarToUseAsSources) {
    const {
      abarData: { atxoSid, ownedAbar },
    } = ownedAbarToUseAsSource;
    let receiverXfrPublicKey;
    try {
      receiverXfrPublicKey = ledger.public_key_from_base64(receiver.publickey);
    } catch (error) {
      throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_PUBLIC_KEY_FROM_BASE64 });
    }

    let myOwnedAbar;
    try {
      myOwnedAbar = ledger.abar_from_json(ownedAbar);
    } catch (error) {
      throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_ABAR_FROM_JSON, data: { sid: atxoSid } });
    }

    const [myMemoData, mTLeafInfo] = await Promise.all([getAbarOwnerMemo(atxoSid), getMTLeafInfo(atxoSid)]);

    if (myMemoData.error) {
      throw new SdkError({
        errorCode: ErrorCodes.API_GET_ABAR_MEMO_ERROR,
        data: { sid: atxoSid },
        message: myMemoData.error.message,
      });
    }

    if (mTLeafInfo.error) {
      throw new SdkError({
        errorCode: ErrorCodes.API_GET_ABAR_PROOF_ERROR,
        data: { sid: atxoSid },
        message: mTLeafInfo.error.message,
      });
    }

    let abarOwnerMemo;
    try {
      abarOwnerMemo = ledger.AxfrOwnerMemo.from_json(myMemoData.response);
    } catch (error) {
      throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_OWNER_MEMO_FROM_JSON });
    }

    let myMTLeafInfo;
    try {
      myMTLeafInfo = ledger.MTLeafInfo.from_json(mTLeafInfo.response);
    } catch (error) {
      throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_MERKLE_PROOF_FROM_JSON });
    }

    try {
      transactionBuilder = transactionBuilder.add_operation_abar_to_bar(
        myOwnedAbar,
        abarOwnerMemo,
        myMTLeafInfo,
        aXfrSpendKeySender,
        receiverXfrPublicKey,
        false,
        false,
      );
    } catch (error) {
      throw new SdkError({
        errorCode: ErrorCodes.FAILED_TO_ADD_OPERATION_ABAR2BAR,
        message: formatWasmErrorMessage(error),
      });
    }
  }

  try {
    transactionBuilder = transactionBuilder.build();
  } catch (err) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_BUILD_TRANSACTION });
  }

  const { response: submitHandle, error: handleError } = await submitTransaction(transactionBuilder.transaction());

  if (handleError) {
    throw new SdkError({ errorCode: ErrorCodes.API_SUBMIT_TRANSACTION_ERROR, message: handleError.message });
  }

  if (!submitHandle) {
    throw new SdkError({ errorCode: ErrorCodes.API_SUBMIT_TRANSACTION_ERROR });
  }

  const { blockTime } = Sdk.environment;
  await sleep(blockTime);

  const { response: txnResponse, error: hashError } = await getHashSwap(submitHandle);

  if (hashError) {
    throw new SdkError({ errorCode: ErrorCodes.API_SEARCH_TRANSACTION_ERROR, message: hashError.message });
  }

  if (!txnResponse) {
    throw new SdkError({ errorCode: ErrorCodes.API_SEARCH_TRANSACTION_ERROR });
  }

  const { hash: txnHash, tx_result: txResult } = txnResponse.result.txs[0] || {};

  return {
    txnHash,
    txnLog: txResult?.log,
  };
}
