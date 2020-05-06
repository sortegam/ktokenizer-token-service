import Joi from 'joi';
import uuid from 'uuid';
import dynogels, { putItemUniqueSafe } from 'core/lib/dynogels';
import cfg from 'config';
import { logger, LOGGER_TYPES } from 'utils/logger';
import OError from 'core/OperationalError';

const __l = logger.getLogger(LOGGER_TYPES.CORE);

const EncryptedVault = dynogels.define(cfg.TABLE_NAMES.ENCRYPTED_VAULT, {
  hashKey: 'vaultId',
  timestamps: true,
  schema: {
    vaultId: Joi.string()
      .uuid()
      .required(),
    encryptedData: Joi.string()
      .base64()
      .required(),
    hashData: Joi.string().required(),
  },
});

// #############################################################################

EncryptedVault.createUniqueSafeAsync = (data) => {
  const putItemOptions = { regenerateKeyFn: () => uuid() };
  return putItemUniqueSafe(EncryptedVault, data, putItemOptions);
};

// #############################################################################

/**
 * It returns the encrypted Data found in the vault by a passed vaultId
 * @param {uuid} vaultId
 * @returns {string} data encrypted ciphertext blob or null (If no data found)
 * @throws {OError} CORE_VAULT_DATA_QUERY_ERROR
 */
EncryptedVault.getOneByVaultId = async (vaultId) => {
  try {
    const encryptedData = await EncryptedVault.getAsync(vaultId);
    if (!encryptedData) {
      __l.debug('EncryptedVault.getOneByVaultId - The vault id does not exists in the system.');
      return null;
    }
    const { attrs: data } = encryptedData;
    return data;
  } catch (err) {
    __l.error(`EncryptedVault.getOneByVaultId - ${err}`);
    throw new OError(OError.CORE_ENCRYPTED_VAULT_GET_ONE_BY_VAULT_ID_ERROR, err.message);
  }
};

export default EncryptedVault;
