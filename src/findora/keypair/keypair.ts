import { getLedger } from '_src/findora/ledger';
import { generateSeedString } from '_src/utils';
import { SdkError, ErrorCodes } from '_src/auth';

export const genAnonKeys = async (): Promise<FindoraWallet.IAnonWallet> => {
  try {
    const ledger = await getLedger();
    const anonKeys = ledger.gen_anon_keys();

    const axfrPublicKey = anonKeys.pub_key;
    const axfrSpendKey = anonKeys.spend_key;
    const axfrViewKey = anonKeys.view_key;

    const formattedAnonKeys = {
      axfrPublicKey,
      axfrSpendKey,
      axfrViewKey,
    };

    try {
      anonKeys.free();
    } catch (error) {
      throw new Error(`could not get release the anonymous keys instance  "${(error as Error).message}" `);
    }

    return formattedAnonKeys;
  } catch (err) {
    throw new Error(`could not get anon keys, "${err}" `);
  }
};

export async function createWallet(privateStr?: string): Promise<FindoraWallet.IWallet> {
  const ledger = await getLedger();
  let keypair = ledger.new_keypair();

  if (privateStr !== undefined) {
    keypair = ledger.create_keypair_from_secret(`"${privateStr}"`);
  }
  const keypairStr = ledger.keypair_to_str(keypair);

  return {
    keyStore: keypairStr,
    keypair: keypair,
    privateKey: ledger.get_priv_key_str(keypair).replace(/\"/g, ''),
    publickey: ledger.get_pub_key_str(keypair).replace(/\"/g, ''),
    address: ledger.public_key_to_bech32(ledger.get_pk_from_keypair(keypair)),
  };
};

export const getWallet = async (privateStr?: string): Promise<FindoraWallet.IWalletWrap> => {
  const _walletStart = createWallet(privateStr);
  const _walletEnd = createWallet();
  const _anonWallet = genAnonKeys();
  try {
    const [walletStart, anonWallet, walletEnd] = await Promise.all([_walletStart, _anonWallet, _walletEnd]);
    const seeds = [];
    while (seeds.length < 2) {
      const seedStr = generateSeedString();
      !seeds.includes(seedStr) && seeds.push(seedStr);
    }
    return {
      walletStart,
      anonWallet,
      walletEnd,
      seeds,
    };
  } catch (error) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_GENERATE_WALLETS, message: error.message });
  }
};

export const getAXfrPublicKeyByBase64 = async (publicKey: string) => {
  const ledger = await getLedger();
  try {
    return ledger.axfr_pubkey_from_string(publicKey);
  } catch (err) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_AXFR_PUBKEY_FROM_STRING, message: err.message });
  }
};

export const getAXfrPrivateKeyByBase64 = async (privateKey: string) => {
  const ledger = await getLedger();
  try {
    return ledger.axfr_keypair_from_string(privateKey);
  } catch (err) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_AXFR_KEYPAIR_FROM_STRING, message: err.message });
  }
};

export const getAXfrViewKeyByBase64 = async (privateKey: string) => {
  const ledger = await getLedger();
  try {
    return ledger.axfr_viewkey_from_string(privateKey);
  } catch (err) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_AXFR_VIEWKEY_FROM_STRING, message: err.message });
  }
};
