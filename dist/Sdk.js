import Web3 from 'web3';
import { initLedger } from './findora/ledger';
const SdkDefaultEnvironment = {
    hostUrl: 'https://dev-qa01.dev.findora.org',
    queryPort: '8667',
    ledgerPort: '8668',
    submissionPort: '8669',
    explorerApiPort: '26657',
    web3: new Web3(Web3.givenProvider),
    blockTime: 15000,
    apiRetryDelay: 3000,
};
export class Sdk {
    static environment = { ...SdkDefaultEnvironment };
    static init(sdkEnv) {
        Sdk.environment = { ...SdkDefaultEnvironment, ...sdkEnv };
        return initLedger();
    }
}
//# sourceMappingURL=Sdk.js.map