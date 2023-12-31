declare namespace FindoraWallet {
  export interface IWalletWrap {
    walletStart: FindoraWallet.IWallet;
    anonWallet: FindoraWallet.IAnonWallet;
    walletEnd: FindoraWallet.IWallet;
    currentStep?: number;
    seeds?: string[];
  }

  export interface IAnonWallet {
    axfrPublicKey?: string;
    axfrSpendKey?: string;
    axfrViewKey?: string;
    name?: string;
    commitments?: string[];
    ownedAbars?: IOwnedAbarItem[];
  }

  export interface IWallet {
    keyStore?: Uint8Array | string;
    publickey?: string;
    address?: string;
    name?: string;
    keypair?: any;
    privateKey?: string;
  }

  export interface IOwnedAbarItem {
    commitment: string;
    abarData: {
      atxoSid: string;
      ownedAbar: {
        commitment: string;
      };
    };
  }

  export interface IOpenedAbar {
    amount: string;
    asset_type: number[];
    blind: string;
    pub_key: string;
    key_rand_factor: string;
    owner_memo: {
      blind_share: string;
      lock: {
        ciphertext: string;
        ephemeral_public_key: string;
      };
    };
    mt_leaf_info: {
      path: {
        nodes: MTleafNode[];
      };
      root: string;
      root_version: string;
      uid: string;
    };
  }

  //  --

  export interface IAssetRules {
    decimals: number;
    transferable: boolean;
    updatable: boolean;
    transfer_multisig_rules: any;
    max_units: null | number;
    tracing_policies: any[];
  }
  export interface ILedgerAsset {
    memo: string;
  }

  export interface IPureAsset extends ILedgerAsset {
    code: {
      val: number[];
    };
    issuer: {
      key: string;
    };
    asset_rules: IAssetRules;
  }

  export interface IAsset extends ILedgerAsset {
    address: string;
    code: string;
    issuer: string;
    memo: string;
    assetRules: IAssetRules;
    numbers: BigInt;
    name: string;
    options?: IAssetCustomOptions;
    ownerMemo?: any;
    record?: any;
  }

  export interface IAssetCustomOptions {
    builtIn: boolean;
    owned: boolean;
  }

  export interface IAssetCustom {
    options?: IAssetCustomOptions;
    assetCode: string;
    nickname: string;
    nicknames: string[];
    address: string;
  }

  interface FormattedAnonKeys {
    axfrPublicKey: string;
    axfrSecretKey: string;
    decKey: string;
    encKey: string;
  }

  export interface BarToAbarData {
    anonKeysFormatted: FormattedAnonKeys;
    commitments: string[];
  }

  export interface AbarToBarData {
    anonKeysSender: FormattedAnonKeys;
  }

  interface ProcessedCommitmentsMap {
    commitmentKey: string;
    commitmentAxfrPublicKey: string;
    commitmentAssetType: string;
    commitmentAmount: string;
  }

  export interface AbarToAbarData {
    anonKeysSender: FormattedAnonKeys;
    anonKeysReceiver: FormattedAnonKeys;
    commitmentsMap: ProcessedCommitmentsMap[];
  }

  export interface BarToAbarResult<T> {
    transactionBuilder: T;
    barToAbarData: BarToAbarData;
    sid: string;
  }

  export interface AnonKeysResponse<T> {
    keysInstance: T;
    formatted: FormattedAnonKeys;
  }

  export interface OwnedAbar {
    commitment: string;
  }

  export interface OwnedAbarData {
    atxoSid: string;
    ownedAbar: OwnedAbar;
  }

  export interface OwnedAbarItem {
    commitment: string;
    abarData: OwnedAbarData;
  }

  export type MTleafNode = {
    siblings1: string;
    siblings2: string;
    is_left_child: number;
    is_right_child: number;
  };

  export interface OpenedAbar {
    amount: string;
    asset_type: number[];
    blind: string;
    pub_key: string;
    owner_memo: {
      blind_share: string;
      lock: {
        ciphertext: string;
        ephemeral_public_key: string;
      };
    };
    mt_leaf_info: {
      path: {
        nodes: MTleafNode[];
      };
      root: string;
      root_version: string;
      uid: string;
    };
  }

  export interface OpenedAbarInfo {
    abar: OpenedAbar;
    amount: string;
    assetType: string;
  }
}
