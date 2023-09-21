import Web3 from 'web3';
import { ethers } from 'ethers';
import { encrypt } from 'eth-sig-util';
import { Sdk } from '_src/Sdk';
const toHex = (covertThis, padding) => {
    const temp1 = ethers.utils.hexZeroPad(ethers.utils.hexlify(BigInt(covertThis)), padding);
    // const temp2 = web3.utils.leftPad(web3.utils.toHex(covertThis), padding);
    // console.log('toHex', temp2, temp1);
    return temp1;
};
const createGenericDepositData = (hexMetaData) => {
    if (hexMetaData === null) {
        return '0x' + toHex('0', 32).substring(2); // len(metaData) (32 bytes)
    }
    const hexMetaDataLength = hexMetaData.substr(2).length / 2;
    return '0x' + toHex(String(hexMetaDataLength), 32).substring(2) + hexMetaData.substr(2);
};
export const getDefaultAccount = async () => {
    const { web3 } = Sdk.environment;
    const [account = ''] = await web3.eth.getAccounts();
    return account;
};
export const gasOptions = async (params = {}, gasLimitValue = 800000) => {
    const gasLimit = Web3.utils.toHex(gasLimitValue);
    const from = await getDefaultAccount();
    return {
        from,
        gasLimit,
        ...params,
    };
};
export const createERCDepositData = (tokenId, senderAddress, tokenAmount, findoraTo) => {
    const { web3 } = Sdk.environment;
    const data = web3.eth.abi.encodeParameters(['uint8', 'uint256', 'address', 'bytes32'], [tokenId, tokenAmount, senderAddress, findoraTo]);
    const fun = web3.eth.abi.encodeFunctionCall({
        inputs: [
            {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
            },
        ],
        name: 'lockToken',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    }, [data]);
    const hexMetaData = '0x' + fun.substr(10);
    if (hexMetaData === null) {
        return '0x' + toHex('0', 32).substr(2);
    }
    const hexMetaDataLength = hexMetaData.substr(2).length / 2;
    console.log('length:', hexMetaDataLength);
    return '0x' + toHex(String(hexMetaDataLength), 32).substr(2) + hexMetaData.substr(2);
};
export const signature = async (data, address) => {
    const { web3 } = Sdk.environment;
    return await web3.eth.personal.sign(web3.utils.utf8ToHex(data), address, 'x25519-xsalsa20-poly1305');
};
export const sign = async (data) => {
    const { web3 } = Sdk.environment;
    const account = await getDefaultAccount();
    const encryptionPublicKey = await window.ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [account],
    });
    const encryptedMessage = web3.utils.utf8ToHex(JSON.stringify(encrypt(encryptionPublicKey, { data }, 'x25519-xsalsa20-poly1305')));
    return encryptedMessage;
};
export const decrypted = async (data) => {
    const account = await getDefaultAccount();
    const decryptedMessage = await window.ethereum.request({
        method: 'eth_decrypt',
        params: [data, account],
    });
    return JSON.parse(decryptedMessage);
};
export const createLowLevelData = async (destinationChainId, tokenAmount, tokenId, recipientAddress, funcName) => {
    const { web3 } = Sdk.environment;
    const data = web3.eth.abi.encodeParameters(['uint256', 'address', 'uint256'], [tokenId, recipientAddress, tokenAmount]);
    const fun = web3.eth.abi.encodeFunctionCall({
        inputs: [
            {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
            },
        ],
        name: 'withdrawToOtherChainCallback',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    }, [data]);
    const dt = '0x' + fun.substr(10);
    const callData = createGenericDepositData(dt);
    const fun1 = web3.eth.abi.encodeFunctionCall({
        inputs: [
            {
                name: 'chainId',
                type: 'uint8',
            },
            {
                name: 'data',
                type: 'bytes',
            },
        ],
        name: funcName,
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    }, [destinationChainId, callData]);
    return fun1;
};
export const getCurrentBalance = async () => {
    const { web3 } = Sdk.environment;
    const account = await getDefaultAccount();
    return await web3.eth.getBalance(account);
};
//# sourceMappingURL=web3.js.map