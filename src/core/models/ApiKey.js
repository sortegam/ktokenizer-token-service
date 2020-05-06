import crypto from 'crypto';
import Joi from 'joi';
import dynogels, { putItemUniqueSafe } from 'core/lib/dynogels';
import cfg from 'config';

// #############################################################################

export const PERMISSIONS = {
  CAN_DELETE_TOKEN: 'canDeleteToken',
  CAN_DETOKENIZE: 'canDetokenize',
  CAN_TOKENIZE: 'canTokenize',
  CAN_VALIDATE_TOKEN: 'canValidateToken',
  ENABLED_IP_FILTERING: 'enabledIPFiltering',
  IP_WHITELIST: 'IPWhitelist',
  CAN_GET_OPERATIONS: 'canGetOperations',
};

const apiKeyGeneration = () => crypto.randomBytes(128).toString('hex');

const ApiKey = dynogels.define(cfg.TABLE_NAMES.APIKEYS, {
  hashKey: 'apiKey',
  timestamps: true,
  schema: {
    apiKey: Joi.string().default(apiKeyGeneration()),
    alias: Joi.string().required(),
    accountId: Joi.string()
      .uuid()
      .required(),
    permissions: Joi.object()
      .keys(Object.values(PERMISSIONS).reduce(
        (total, permission) => ({ ...total, [permission]: Joi.any() }),
        {},
      ))
      .required(),
  },
  indexes: [
    {
      hashKey: 'accountId',
      rangeKey: 'createdAt',
      name: 'apiKeysByAccountIdSortCreatedAtIndex',
      type: 'global',
    },
  ],
});

ApiKey.createUniqueSafeAsync = (data) => {
  const putItemOptions = { regenerateKeyFn: apiKeyGeneration };
  return putItemUniqueSafe(ApiKey, data, putItemOptions);
};

export default ApiKey;
