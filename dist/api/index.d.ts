import { NetworkAxiosConfig, NetworkAxiosDataResult } from '../types/types';
export declare const apiPost: (url: string, data?: any, config?: NetworkAxiosConfig) => Promise<NetworkAxiosDataResult>;
export declare const apiGet: (url: string, config?: NetworkAxiosConfig) => Promise<NetworkAxiosDataResult>;
