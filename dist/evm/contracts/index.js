import Web3 from 'web3';
import { Sdk } from '_src/Sdk';
import Erc20Abi from './abis/Erc20Abi.json';
import BridgeAbi from './abis/BridgeAbi.json';
import RelayerAbi from './abis/RelayerAbi.json';
import SimBridgeAbi from './abis/SimBridgeAbi.json';
import DeckAbi from './abis/DeckAbi.json';
import PrismBridgeAbi from './abis/PrismBridgeAbi.json';
import PoolAbi from './abis/PoolAbi.json';
const createContract = (address, abi, provider) => {
    const { web3 } = Sdk.environment;
    const web3Instance = (provider ? new Web3(provider) : web3);
    web3Instance.eth.transactionBlockTimeout = 200;
    return new web3Instance.eth.Contract(abi, address);
};
export const erc20 = (address, provider) => {
    return createContract(address, Erc20Abi, provider);
};
export const bridge = (address, provider) => {
    return createContract(address, BridgeAbi, provider);
};
export const simBridge = (address, provider) => {
    return createContract(address, SimBridgeAbi, provider);
};
export const relayer = (address, provider) => {
    return createContract(address, RelayerAbi, provider);
};
export const deck = (address, provider) => {
    return createContract(address, DeckAbi, provider);
};
export const prismBridge = (address, provider) => {
    return createContract(address, PrismBridgeAbi, provider);
};
export const pool = (address, provider) => {
    return createContract(address, PoolAbi, provider);
};
//# sourceMappingURL=index.js.map