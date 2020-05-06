import uuid from 'uuid';
import { logger, LOGGER_TYPES } from 'utils/logger';
import OError from 'core/OperationalError';
import { ENCRYPT_TYPES, encrypt as kmsEncrypt, decrypt as kmsDecrypt } from 'core/kms';
import EncryptedVault from 'core/models/EncryptedVault';
import TokenData from 'core/models/TokenData';
import { getDataHash, isDataEmpty } from 'core/utils/helpers';
import { isValidFormattedToken } from 'core/utils/validators';

// #############################################################################

const __l = logger.getLogger(LOGGER_TYPES.CORE);

export { ENCRYPT_MAX_DATA_LENGTH } from 'core/kms';

// #############################################################################
// ### TOKENIZER / DETOKENIZER HELPERS
// #############################################################################

// #############################################################################

// #############################################################################

/**
 * It deletes a token and data associated if found.
 * @param {uuid} Token delete
 * @param {string} requestAccountId The accountId associated
 * @returns {boolean} True if deleted / false if failed to delete or not found
 * @throws CORE_TOKEN_FORMAT_INVALID - if token format is invalid (not uuid)
 * @throws CORE_TOKEN_DATA_NOT_FOUND - If token not found in database
 * @throws CORE_DELETE_ENCRYPTED_VAULT_ERROR - If error deleting from database
 */
export const deleteToken = async (token, requestAccountId) => {
  const validFormattedToken = await isValidFormattedToken(token);
  if (validFormattedToken === false) {
    throw new OError(OError.CORE_TOKEN_FORMAT_INVALID);
  }
  const tokenData = await TokenData.getOneByAccount(token, requestAccountId);
  if (!tokenData) {
    throw new OError(OError.CORE_TOKEN_DATA_NOT_FOUND);
  }
  const { vaultId } = tokenData;
  __l.debug(`deleteToken - vaultId detected to remove: ${vaultId}`);
  try {
    EncryptedVault.destroy(vaultId);
    TokenData.destroy(token);
  } catch (err) {
    throw new OError(OError.CORE_DELETE_ENCRYPTED_VAULT_ERROR, err.message);
  }
};

// #############################################################################
// ### CORE TOKENIZER
// #############################################################################

/**
 * Tokenize core method to tokenize custom data
 * @param {object} data to be tokenized
 * @param {string} requestAccountId The accountId associated
 * @param {string} hash to store (if no halt passed then data object will be hashed)
 * @throws {OError} CORE_DATA_PARAM_MISSING
 * @throws {OError} CORE_ENCRYPTED_VAULT_DATA_CREATE_ERROR
 * @throws {OError} CORE_TOKENDATA_CREATE_ERROR
 */
export const tokenize = async (data, requestAccountId, hash = getDataHash(data)) => {
  if (isDataEmpty(data)) {
    throw new OError(OError.CORE_DATA_PARAM_MISSING);
  }
  const encryptedData = await kmsEncrypt(data, ENCRYPT_TYPES.BASE64);
  __l.trace(`tokenize - Data hash generated: ${hash}`);
  let encryptedVaultItem = null;
  try {
    encryptedVaultItem = await EncryptedVault.createUniqueSafeAsync({
      vaultId: uuid(),
      encryptedData,
      hashData: hash,
    });
  } catch (err) {
    throw new OError(OError.CORE_ENCRYPTED_VAULT_DATA_CREATE_ERROR, err.message);
  }
  const { attrs: vaultItem } = encryptedVaultItem;
  __l.trace(`core:tokenize - Vault item created: ${JSON.stringify(vaultItem)}`);
  let resultTokenData = null;
  try {
    // Store Meta
    resultTokenData = await TokenData.createUniqueSafeAsync({
      token: uuid(),
      vaultId: vaultItem.vaultId,
      accountId: requestAccountId,
    });
  } catch (err) {
    throw new OError(OError.CORE_TOKENDATA_CREATE_ERROR, err.message);
  }
  const { attrs: tokenData } = resultTokenData;
  const { token } = tokenData;
  __l.debug(`tokenize:tokenizer - Token generated: ${token}`);
  return token;
};

// #############################################################################
// ### CORE DETOKENIZER
// #############################################################################

/**
 * Core method to detokenize encrypted vault data with a passed token
 * @param {uuid} token
 * @param {string} requestAccountId The accountId associated
 * @returns {string} Decrypted data
 * @throws {OError} CORE_TOKEN_FORMAT_INVALID
 * @throws {OError} CORE_TOKEN_DATA_NOT_FOUND
 * @throws {OError} CORE_ENCRYPTED_VAULT_DATA_NOT_FOUND
 */
export const detokenize = async (token, requestAccountId) => {
  const validFormattedToken = await isValidFormattedToken(token);
  if (validFormattedToken === false) {
    throw new OError(OError.CORE_TOKEN_FORMAT_INVALID);
  }
  const tokenData = await TokenData.getOneByAccount(token, requestAccountId);
  if (!tokenData) {
    throw new OError(OError.CORE_TOKEN_DATA_NOT_FOUND);
  }
  const { vaultId } = tokenData;
  __l.debug(`core:detokenize - vaultId related is ${vaultId}`);
  const { encryptedData } = await EncryptedVault.getOneByVaultId(vaultId);
  if (!encryptedData) {
    throw new OError(OError.CORE_ENCRYPTED_VAULT_DATA_NOT_FOUND);
  }
  __l.trace(`detokenize EncryptedData string is: ${JSON.stringify(encryptedData)}`);
  const decryptedData = await kmsDecrypt(encryptedData, ENCRYPT_TYPES.BASE64);
  return decryptedData;
};

// #############################################################################
// ### CORE VERIFY TOKEN
// #############################################################################

/**
 * Core method to detokenize encrypted vault data with a passed token
 * @param {uuid} token
 * @param {string} requestAccountId The accountId associated
 * @returns {bool} True if token exists False if token not exists
 * @throws {OError} CORE_TOKEN_FORMAT_INVALID
 */
export const verifyToken = async (token, requestAccountId) => {
  const tokenData = await TokenData.getOneByAccount(token, requestAccountId);
  if (!tokenData) {
    return false;
  }

  if (tokenData.token === token) {
    return true;
  }
  return false;
};
