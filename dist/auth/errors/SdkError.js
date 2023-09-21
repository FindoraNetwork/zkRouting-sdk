export const ErrorCodes = {
    FAILED_TO_CONVERT_KEYPAIR_FROM_STRING: 'W001',
    FAILED_TO_GET_MINIMAL_FEE: 'W002',
    FAILED_TO_CONVERT_OWNER_MEMO_FROM_JSON: 'W003',
    FAILED_TO_CONVERT_CLIENT_ASSET_RECORD_FROM_JSON: 'W004',
    FAILED_TO_CONVERT_AXFR_PUBKEY_FROM_STRING: 'W005',
    FAILED_TO_CONVERT_AXFR_KEYPAIR_FROM_STRING: 'W007',
    FAILED_TO_CONVERT_AXFR_VIEWKEY_FROM_STRING: 'W008',
    FAILED_TO_CONVERT_PUBLIC_KEY_FROM_BASE64: 'W009',
    FAILED_TO_CONVERT_ABAR_FROM_JSON: 'W010',
    FAILED_TO_CONVERT_MERKLE_PROOF_FROM_JSON: 'W011',
    FAILED_TO_GENERATE_WALLETS: 'W012',
    FAILED_TO_CONVERT_FRA_ADDRESS: 'W013',
    FAILED_TO_ADD_OPERATION_BAR2ABAR: 'W101',
    FAILED_TO_ADD_OPERATION_ABAR2BAR: 'W102',
    FAILED_TO_GENERATE_TRANSFER_OPERATION: 'W103',
    FAILED_TO_ADD_TRANSFER_OPERATION: 'W104',
    FAILED_TO_ADD_OPERATION_CONVERT_ACCOUNT: 'W105',
    FAILED_TO_SIGN_TRANSACTION: 'W106',
    FAILED_TO_BUILD_TRANSACTION: 'W107',
    FAILED_TO_ADD_FEE_BAR2ABAR: 'W108',
    FAILED_TO_GET_COMMITMENTS: 'W111',
    FAILED_TO_CALL_CONTRACT_FUNCTION: 'W201',
    FAILED_TO_ESTIMATE_GAS_FEE: 'W202',
    NO_MATCHING_DATA_FOUND: 'SDK001',
    API_GET_UTXO_ERROR: 'A001',
    API_GET_STATE_COMMITMENT_ERROR: 'A002',
    API_SUBMIT_TRANSACTION_ERROR: 'A003',
    API_SEARCH_TRANSACTION_ERROR: 'A004',
    API_GET_OWNED_ABAR_ERROR: 'A005',
    API_GET_ABAR_MEMO_ERROR: 'A006',
    API_GET_ABAR_PROOF_ERROR: 'A007',
    API_GET_SIDS_ERROR: 'A008',
    API_GET_ASSET_TOKEN: 'A009',
    TRANSACTION_IN_STUCK_ERROR: 'M001'
};
export const ErrorCodeMessages = {
    'W001': 'Failed to constructs keypair from hex-encoded string',
    'W002': 'Failed to get minmal fee',
    'W003': 'Failed to convert owned_memo from json',
    'W004': 'Failed to convert client_asset_record from json',
    'W005': 'Failed to convert axfr_pubkey from json',
    'W007': 'Failed to convert axfr_keypair from json',
    'W008': 'Failed to convert axfr_viewkey from json',
    'W009': 'Failed to convert public_key from base64',
    'W010': 'Failed to convert abar from json',
    'W011': 'Failed to convert merkle proof from json',
    'W012': 'Failed to generate wallets',
    'W013': 'Failed to convert fra address',
    'W101': 'Failed to add operation bar to abar',
    'W102': 'Failed to add operation abar to bar',
    'W103': 'Failed to generate transfer operation',
    'W104': 'Failed to add transfer operation',
    'W105': 'Failed to add operation convert account',
    'W106': 'Failed to sign transaction',
    'W107': 'Failed to build transaction',
    'W108': 'Failed to add fee bar to abar',
    'W111': 'Failed to get commitments',
    'W201': 'Failed to call contract function',
    'W202': 'Failed to estimate gas fee',
    'SDK001': 'Not matching data found',
    'A001': 'API request failed: /get_utxo',
    'A002': 'API request failed: /global_state',
    'A003': 'API request failed: /submit_transaction',
    'A004': 'API request failed: /tx_search',
    'A005': 'API request failed: /owned_abar',
    'A006': 'API request failed: /get_abar_memo',
    'A007': 'API request failed: /get_abar_proof',
    'A008': 'API request failed: /get_owned_utxos',
    'A009': 'API request failed: /asset_token',
    'M001': 'MetaMask Pending Transaction Stuck'
};
export class SdkError extends Error {
    errorCode;
    description;
    args;
    data = {};
    constructor({ errorCode, message, data }) {
        super(message);
        this.data = data || {};
        if (errorCode) {
            this.errorCode = errorCode;
            this.args = `${Object.keys(this.data).map(key => `${key}: ${this.data[key]}`).join(', ')}`;
            this.message = `ERROR[${this.errorCode}] - (${this.args}): ${this.message || ErrorCodeMessages[this.errorCode]}`;
        }
    }
}
//# sourceMappingURL=SdkError.js.map