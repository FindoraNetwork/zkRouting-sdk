import Web3 from 'web3';
import { AbiItem } from 'ethereum-abi-types-generator';

import { Sdk } from '_src/Sdk';
import Erc20Abi from './abis/Erc20Abi.json';
import BridgeAbi from './abis/BridgeAbi.json';
import RelayerAbi from './abis/RelayerAbi.json';
import SimBridgeAbi from './abis/SimBridgeAbi.json';
import DeckAbi from './abis/DeckAbi.json';
import PoolAbi from './abis/PoolAbi.json';
import { ContractContext as Relayer } from './types/Relayer';
import { ContractContext as SimBridge } from './types/SimBridge';
import { ContractContext as Deck } from './types/Deck';
import { ContractContext as Bridge } from './types/Bridge';
import { ContractContext as Erc20 } from './types/Erc20';
import { ContractContext as Pool } from './types/Pool';

const createContract = (address: string, abi: any, provider?: string) => {
  const { web3 } = Sdk.environment;
  const web3Instance = (provider ? new Web3(provider) : web3);
  web3Instance.eth.transactionBlockTimeout = 200;
  return new web3Instance.eth.Contract(abi as AbiItem[], address);
};

export const erc20 = (address: string, provider?: string) => {
  return createContract(address, Erc20Abi, provider) as unknown as Erc20;
};

export const bridge = (address: string, provider?: string) => {
  return createContract(address, BridgeAbi, provider) as unknown as Bridge;
};

export const simBridge = (address: string, provider?: string) => {
  return createContract(address, SimBridgeAbi, provider) as unknown as SimBridge;
};

export const relayer = (address: string, provider?: string) => {
  return createContract(address, RelayerAbi, provider) as unknown as Relayer;
};

export const deck = (address: string, provider?: string) => {
  return createContract(address, DeckAbi, provider) as unknown as Deck;
};

export const prismBridge = (address: string, provider?: string) => {
  return createContract(address, SimBridgeAbi, provider) as unknown as SimBridge;
};

export const pool = (address: string, provider?: string) => {
  return createContract(address, PoolAbi, provider) as unknown as Pool;
};
