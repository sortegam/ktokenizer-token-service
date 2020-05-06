import Joi from 'joi';
import uuid from 'uuid';
import dynogels, { putItemUniqueSafe } from 'core/lib/dynogels';
import cfg from 'config';
import { logger, LOGGER_TYPES } from 'utils/logger';
import OError from 'core/OperationalError';

const __l = logger.getLogger(LOGGER_TYPES.CORE);

const TokenData = dynogels.define(cfg.TABLE_NAMES.TOKEN_DATA, {
  hashKey: 'token',
  timestamps: true,
  schema: {
    token: dynogels.types.uuid(),
    vaultId: Joi.string()
      .uuid()
      .required(),
    accountId: Joi.string()
      .uuid()
      .required(),
  },
});

// #############################################################################

TokenData.createUniqueSafeAsync = (data) => {
  const putItemOptions = { regenerateKeyFn: () => uuid() };
  return putItemUniqueSafe(TokenData, data, putItemOptions);
};

// #############################################################################

/**
 * It returns the data found by a passed token
 * @param {uuid} token
 * @param {string} requestAccountId Associated accountId
 * @returns {object} DataObject with MetaData or null (If no data found)
 * @throws {OError} CORE_TOKEN_DATA_QUERY_ERROR
 */
TokenData.getOneByAccount = async (token, requestAccountId) => {
  try {
    // Get toke
    const tokenData = await TokenData.getAsync(token);
    if (!tokenData) {
      __l.debug(`TokenData.getOneByAccount - The token passed (${token}) does not exists in the system.`);
      return null;
    }
    __l.debug(`getOneByAccount - The token passed (${token}) was found in the system.`);
    const { attrs: data } = tokenData;
    const { accountId: tokenAccountId } = data;
    // AccountID Owner validator
    if (tokenAccountId === requestAccountId) {
      return data;
    }
    return null;
  } catch (err) {
    __l.error(`getOneByAccount - ${err}`);
    throw new OError(OError.CORE_TOKEN_DATA_QUERY_ERROR, err.message);
  }
};

export default TokenData;
