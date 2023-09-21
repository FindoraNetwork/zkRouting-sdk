import Web3 from 'web3';
import { gasOptions } from '_src/web3';
import * as contracts from '_src/evm/contracts';
import { SdkError, ErrorCodes } from '_src/auth';
import { calculationDecimalsAmount } from '_src/utils';
export const approveToken = async (tokenAddress, bridgeAddress, amount) => {
    const contract = contracts.erc20(tokenAddress);
    const { from } = await gasOptions();
    const finalAmount = await calculationDecimalsAmount(contract, amount, 'toWei');
    let txHash = '';
    return new Promise((resolve, reject) => {
        contract.methods
            .approve(bridgeAddress, finalAmount)
            .send({ from })
            .once('transactionHash', (hash) => { txHash = hash; })
            .once('receipt', (receipt) => { resolve(receipt); })
            .once('error', (error) => {
            if (txHash) {
                resolve({ transactionHash: txHash });
            }
            else {
                const errorCode = error.message.includes('Transaction was not mined within')
                    ? ErrorCodes.TRANSACTION_IN_STUCK_ERROR
                    : ErrorCodes.FAILED_TO_CALL_CONTRACT_FUNCTION;
                reject(new SdkError({
                    errorCode,
                    data: { function: 'approve', txHash },
                    message: error.message
                }));
            }
        });
    });
};
export const getAssetCode = async (prismBridgeAddress, tokenAddress, provider) => {
    try {
        const contract = contracts.prismBridge(prismBridgeAddress, provider);
        const assetHex = await contract.methods.computeERC20AssetType(tokenAddress).call();
        const assetCode = Buffer.from(Web3.utils.hexToBytes(assetHex))
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        return assetCode;
    }
    catch (error) {
        throw new SdkError({
            errorCode: ErrorCodes.FAILED_TO_CALL_CONTRACT_FUNCTION,
            data: {
                function: 'computeERC20AssetType',
                tokenAddress,
            },
            message: error.message
        });
    }
};
//# sourceMappingURL=services.js.map