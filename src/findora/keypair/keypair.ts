import { getLedger } from '_src/findora/ledger';
import { generateSeedString } from '_src/utils';
import { SdkError, ErrorCodes } from '_src/auth';

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
  const _anonWallet = createWallet();
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
    return ledger.public_key_from_base64(publicKey);
  } catch (err) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_AXFR_PUBKEY_FROM_STRING, message: err.message });
  }
};

export const getAXfrPrivateKeyByBase64 = async (privateKey: string) => {
  const ledger = await getLedger();
  const toSend = `"${privateKey}"`;
  try {
    return ledger.create_keypair_from_secret(toSend);
  } catch (err) {
    throw new SdkError({ errorCode: ErrorCodes.FAILED_TO_CONVERT_AXFR_KEYPAIR_FROM_STRING, message: err.message });
  }
};

