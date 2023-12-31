import axios from 'axios';
import JSONbig from 'json-bigint';
import { NetworkAxiosConfig, NetworkAxiosDataResult } from '../types/types';

const _axios = axios.create({});
_axios.defaults.transformResponse = [
  (data) => {
    try {
      return JSONbig({ useNativeBigInt: true }).parse(data);
    } catch (_) {
      return data;
    }
  },
];

export const apiPost = async (
  url: string,
  data?: any,
  config?: NetworkAxiosConfig,
): Promise<NetworkAxiosDataResult> => {
  let axiosResponse;

  try {
    axiosResponse = await _axios.post(url, data, config);
  } catch (err) {
    const e: Error = err as Error;
    return { error: { message: e.message } };
  }

  try {
    const myResponse = axiosResponse.data;
    return { response: myResponse };
  } catch (err) {
    const e: Error = err as Error;

    return { error: { message: e.message } };
  }
};

export const apiGet = async (url: string, config?: NetworkAxiosConfig): Promise<NetworkAxiosDataResult> => {
  let axiosResponse;

  try {
    axiosResponse = await _axios.get(url, config);
  } catch (err) {
    const e: Error = err as Error;

    return { error: { message: e.message } };
  }

  try {
    const myResponse = axiosResponse.data;
    return { response: myResponse };
  } catch (err) {
    const e: Error = err as Error;

    return { error: { message: e.message } };
  }
};
