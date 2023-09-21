import BigNumber from 'bignumber.js';
import sleep from 'sleep-promise';
import { Sdk } from '_src/Sdk';
import { getTransactionBuilder } from '_src/findora/services/services';
import { getOwnedSids, getUtxo, getOwnerMemo, getAssetToken, submitTransaction, getHashSwap } from '_src/findora/apis/apis';
import { getLedger } from '_src/findora/ledger';
import { formatWasmErrorMessage } from '_src/utils';
import { SdkError, ErrorCodes } from '_src/auth';
async function createReceivedTransferOperation(wallet, recieversInfo, assetCode, transferOp) {
    const ledger = await getLedger();
    const totalUtxoNumbers = recieversInfo.reduce((acc, receiver) => {
        return BigInt(Number(receiver.utxoNumbers) + Number(acc));
    }, BigInt(0));
    let utxoNumbers = BigInt(0);
    const { response: sids, error: sidsError } = await getOwnedSids(wallet.publickey);
    if (sidsError) {
        throw new Error(sidsError.message);
    }
    const utxoDataList = [];
    for (const sid of sids) {
        try {
            const [{ response: utxoData }, { response: memoData }] = await Promise.all([getUtxo(sid), getOwnerMemo(sid)]);
            const assetRecord = ledger.ClientAssetRecord.from_json(utxoData.utxo);
            const ownerMemo = memoData ? ledger.OwnerMemo.from_json(memoData) : undefined;
            const decryptAssetData = ledger.open_client_asset_record(assetRecord, ownerMemo?.clone(), wallet.keypair);
            decryptAssetData.asset_type = ledger.asset_type_from_jsvalue(decryptAssetData.asset_type);
            decryptAssetData.amount = BigInt(decryptAssetData.amount);
            utxoDataList.push({
                address: wallet.address,
                sid,
                body: decryptAssetData || {},
                utxo: { ...utxoData.utxo },
                ownerMemo: ownerMemo?.clone(),
                memoData,
            });
        }
        catch (error) {
            console.log(`Could not add decryptAssetData to utxoDataList: ${error.message}`);
            continue;
        }
    }
    let balance = totalUtxoNumbers;
    const sendUtxoList = [];
    for (const assetItem of utxoDataList) {
        if (assetItem.body.asset_type === assetCode) {
            const _amount = BigInt(assetItem.body.amount);
            if (BigInt(_amount) == balance) {
                sendUtxoList.push({
                    amount: balance,
                    originAmount: _amount,
                    sid: assetItem.sid,
                    utxo: { ...assetItem.utxo },
                    ownerMemo: assetItem.ownerMemo,
                    memoData: assetItem.memoData,
                });
                break;
            }
        }
    }
    let inputAmount = BigInt(0);
    const inputParametersList = [];
    for (const item of sendUtxoList) {
        inputAmount = BigInt(Number(inputAmount) + Number(item.originAmount));
        let assetRecord;
        try {
            assetRecord = ledger.ClientAssetRecord.from_json(item.utxo);
        }
        catch (error) {
            throw new Error(`Can not get client asset record. Details: "${error.message}"`);
        }
        let txoRef;
        try {
            txoRef = ledger.TxoRef.absolute(BigInt(item.sid));
        }
        catch (error) {
            throw new Error(`Can not convert given sid id to a BigInt, "${item.sid}", Details - "${error.message}"`);
        }
        const inputParameters = {
            txoRef,
            assetRecord,
            ownerMemo: item?.ownerMemo,
            amount: item.amount,
            memoData: item.memoData,
            sid: item.sid,
        };
        inputParametersList.push(inputParameters);
    }
    for (const inputParameters of inputParametersList) {
        const { txoRef, assetRecord, amount, ownerMemo } = inputParameters;
        utxoNumbers = utxoNumbers + BigInt(amount.toString());
        transferOp = transferOp.add_input_no_tracing(txoRef, assetRecord, ownerMemo, wallet.keypair, amount);
    }
    recieversInfo.forEach((reciverInfo) => {
        const { utxoNumbers, toPublickey, assetBlindRules } = reciverInfo;
        const blindIsAmount = assetBlindRules?.isAmountBlind;
        const blindIsType = assetBlindRules?.isTypeBlind;
        transferOp = transferOp.add_output_no_tracing(utxoNumbers, toPublickey, assetCode, !!blindIsAmount, !!blindIsType);
    });
    return transferOp;
}
async function sendUtxoToEvm({ wallet, convertAmount, assetCode }) {
    const ledger = await getLedger();
    // const decimals = asset.properties.asset_rules.decimals;
    // const convertAmount = BigInt(new BigNumber(amount).times(10 ** decimals).toString());
    const assetBlindRules = {
        isAmountBlind: false,
        isTypeBlind: false,
    };
    const address = ledger.base64_to_bech32(ledger.get_coinbase_address());
    const publickey = ledger.bech32_to_base64(address);
    const recieversInfo = [
        {
            toPublickey: ledger.public_key_from_base64(publickey),
            utxoNumbers: convertAmount,
            assetBlindRules,
        },
    ];
    let transferOp = ledger.TransferOperationBuilder.new();
    transferOp = await createReceivedTransferOperation(wallet, recieversInfo, assetCode, transferOp);
    const fraAssetCode = ledger.fra_get_asset_code();
    const feeInfos = [
        {
            utxoNumbers: ledger.fra_get_minimal_fee(),
            toPublickey: ledger.fra_get_dest_pubkey(),
        },
    ];
    transferOp = await createReceivedTransferOperation(wallet, feeInfos, fraAssetCode, transferOp);
    return transferOp.create().sign(wallet.keypair).transaction();
}
export const barToEVM = async (wallet, amount, ethAddress, assetCode, lowLevelData, isSourceCross) => {
    const ledger = await getLedger();
    const newWallet = {
        address: wallet.address,
        publickey: wallet.publickey,
        keypair: ledger.create_keypair_from_secret(`"${wallet.privateKey}"`),
    };
    const fraAssetCode = ledger.fra_get_asset_code();
    const mainAssetCode = assetCode || fraAssetCode;
    let transactionBuilder = await getTransactionBuilder();
    const { response: asset, error: assetError } = await getAssetToken(mainAssetCode);
    if (assetError) {
        throw new SdkError({
            errorCode: ErrorCodes.API_GET_ASSET_TOKEN,
            data: { assetCode: mainAssetCode },
            message: assetError.message,
        });
    }
    const decimals = asset.properties.asset_rules.decimals;
    const convertAmount = BigInt(new BigNumber(amount).times(10 ** decimals).toString(10)) - (isSourceCross ? 10n : 0n);
    let receivedTransferOperation;
    try {
        receivedTransferOperation = await sendUtxoToEvm({ wallet: newWallet, convertAmount, assetCode: mainAssetCode });
    }
    catch (error) {
        throw new SdkError({
            errorCode: ErrorCodes.FAILED_TO_GENERATE_TRANSFER_OPERATION,
            message: formatWasmErrorMessage(error),
        });
    }
    const params = [newWallet.keypair, ethAddress, convertAmount];
    (assetCode || (!assetCode && lowLevelData)) && params.push(mainAssetCode);
    lowLevelData && params.push(lowLevelData);
    try {
        transactionBuilder = transactionBuilder.add_transfer_operation(receivedTransferOperation);
    }
    catch (error) {
        throw new SdkError({
            errorCode: ErrorCodes.FAILED_TO_ADD_TRANSFER_OPERATION,
            message: formatWasmErrorMessage(error),
        });
    }
    try {
        transactionBuilder = transactionBuilder.add_operation_convert_account(...params);
    }
    catch (error) {
        throw new SdkError({
            errorCode: ErrorCodes.FAILED_TO_ADD_OPERATION_CONVERT_ACCOUNT,
            message: formatWasmErrorMessage(error),
        });
    }
    try {
        transactionBuilder = transactionBuilder.sign(newWallet.keypair);
    }
    catch (error) {
        throw new SdkError({
            errorCode: ErrorCodes.FAILED_TO_SIGN_TRANSACTION,
            message: formatWasmErrorMessage(error),
        });
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
};
//# sourceMappingURL=transfer.js.map