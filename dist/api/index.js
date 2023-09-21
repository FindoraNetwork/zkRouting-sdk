import axios from 'axios';
import JSONbig from 'json-bigint';
const _axios = axios.create({});
_axios.defaults.transformResponse = [
    (data) => {
        try {
            return JSONbig({ useNativeBigInt: true }).parse(data);
        }
        catch (_) {
            return data;
        }
    },
];
export const apiPost = async (url, data, config) => {
    let axiosResponse;
    try {
        axiosResponse = await _axios.post(url, data, config);
    }
    catch (err) {
        const e = err;
        return { error: { message: e.message } };
    }
    try {
        const myResponse = axiosResponse.data;
        return { response: myResponse };
    }
    catch (err) {
        const e = err;
        return { error: { message: e.message } };
    }
};
export const apiGet = async (url, config) => {
    let axiosResponse;
    try {
        axiosResponse = await _axios.get(url, config);
    }
    catch (err) {
        const e = err;
        return { error: { message: e.message } };
    }
    try {
        const myResponse = axiosResponse.data;
        return { response: myResponse };
    }
    catch (err) {
        const e = err;
        return { error: { message: e.message } };
    }
};
//# sourceMappingURL=index.js.map