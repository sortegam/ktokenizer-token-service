import Joi from 'joi';
import uuid from 'uuid';
import dynogels, { putItemUniqueSafe } from 'core/lib/dynogels';
import cfg from 'config';
import OError from 'core/OperationalError';
import { logger, LOGGER_TYPES } from 'utils/logger';

const __l = logger.getLogger(LOGGER_TYPES.CORE);

// #############################################################################
// ### CONSTANTS
// #############################################################################

export const OPERATION_TYPES = {
  TOKENIZE_DATA: 'tokenize_data',
  DETOKENIZE_DATA: 'detokenize_data',
  DELETE_TOKEN: 'delete_token',
  VALIDATE_TOKEN: 'validate_token',
};

export const OPERATION_STATUSES = {
  REQUESTED: 'requested',
  SUCCESS: 'success',
  FAILED: 'failed',
};

// #############################################################################

const Operation = dynogels.define(cfg.TABLE_NAMES.OPERATIONS, {
  hashKey: 'operationId',
  timestamps: true,
  schema: {
    operationId: dynogels.types.uuid(),
    tokenRelated: Joi.string()
      .uuid()
      .allow(null),
    accountId: Joi.string()
      .uuid()
      .required(),
    type: Joi.string()
      .valid(Object.values(OPERATION_TYPES))
      .required(),
    currentStatus: Joi.string()
      .valid(Object.values(OPERATION_STATUSES))
      .required(),
    requestIPAddress: Joi.string()
      .ip()
      .allow(null),
    historicStatus: Joi.array().items(Joi.object().keys({
      changedAt: Joi.string().default(new Date().toISOString()),
      status: Joi.string()
        .valid(Object.values(OPERATION_STATUSES))
        .required(),
      statusText: Joi.string(),
    })),
  },
  indexes: [
    {
      hashKey: 'accountId',
      rangeKey: 'createdAt',
      name: 'operationsByAccountIdSortCreatedAtIndex',
      type: 'global',
    },
  ],
});

Operation.createUniqueSafeAsync = (data) => {
  const putItemOptions = { regenerateKeyFn: () => uuid() };
  return putItemUniqueSafe(Operation, data, putItemOptions);
};

/**
 * It gets the operation list filtered by a passed account
 * @param {string} accountId
 * @param {filter} The filter
 * @throws {OError} CORE_OPERATIONS_GET_PARAM_INVALID
 * @throws {OError} OPERATION_UPDATE_STATUS_ERROR
 */
Operation.getAllFiltered = ({ accountId, filter }) => {
  try {
    const schema = {
      limit: Joi.number()
        .min(1)
        .max(1000)
        .default(20),
      startingAfter: Joi.object(),
      dateFrom: Joi.string().isoDate(),
      dateTo: Joi.string().isoDate(),
    };
    // Filter check + set default values
    // Joi.attempt will throw an error if the object passed is not
    // validated against the schema
    // otherwise it is going to return the validated values
    const { limit, startingAfter, dateFrom, dateTo } = Joi.attempt(filter, schema);
    const operations = Operation.query(accountId)
      .usingIndex('operationsByAccountIdSortCreatedAtIndex')
      .ascending()
      .limit(limit);
    // #############################################################################
    // ### Pagination
    // #############################################################################
    if (startingAfter) {
      operations.startKey(startingAfter);
    }
    // #############################################################################
    // ### Date Filtering
    // #############################################################################
    if (dateFrom && dateTo) {
      operations.where('createdAt').between(filter.dateFrom, filter.dateTo);
    }
    if (dateFrom && !dateTo) {
      operations.where('createdAt').gte(filter.dateFrom);
    }
    if (!dateFrom && dateTo) {
      operations.where('createdAt').gle(filter.dateTo);
    }
    return operations.execAsync();
  } catch (err) {
    if (err.name === 'ValidationError') {
      // Send up Joi validation message
      throw new OError(OError.CORE_OPERATIONS_GET_PARAM_INVALID, err.details[0].message);
    }
    throw new OError(OError.CORE_OPERATIONS_GET_STATUS_ERROR, err.message);
  }
};

// #############################################################################

/**
 * It creates an operation with a given operation type
 * @param {string} operationType
 * @param {string} requestAccountId
 * @param {string} requestIPAddress
 * @param {string} token related
 * @throws {OError} OPERATION_CREATE_ERROR
 */
Operation.save = async (
  operationType,
  requestAccountId,
  requestIPAddress = '',
  tokenRelated = null,
) => {
  const operationData = {
    accountId: requestAccountId,
    type: operationType,
    tokenRelated,
    currentStatus: OPERATION_STATUSES.REQUESTED,
    requestIPAddress,
    historicStatus: [
      {
        status: OPERATION_STATUSES.REQUESTED,
        changedAt: new Date().toISOString(),
      },
    ],
  };
  try {
    const { attrs: createdOperation } = await Operation.createUniqueSafeAsync(operationData);
    __l.info(`operations - Operation created! (${createdOperation.operationId})`);
    return createdOperation;
  } catch (err) {
    throw new OError(OError.CORE_OPERATION_CREATE_ERROR, err.message);
  }
};

// #############################################################################

/**
 * It updates an operation status and statusText given an operation object
 * @param {object} operation object
 * @param {string} newStatus
 * @param {string} newStatusText
 * @param {string} token related
 * @throws {OError} OPERATION_UPDATE_STATUS_ERROR
 */
Operation.updateStatus = async (operation, newStatus, newStatusText, tokenRelated = null) => {
  try {
    const { attrs: updatedOperation } = await Operation.updateAsync({
      ...operation,
      currentStatus: newStatus,
      tokenRelated,
      historicStatus: [
        ...operation.historicStatus,
        {
          status: newStatus,
          statusText: newStatusText,
          changedAt: new Date().toISOString(),
        },
      ],
    });
    __l.debug(`operations - Operation updated to status: ${newStatus}`);
    return updatedOperation;
  } catch (err) {
    throw new OError(OError.CORE_OPERATION_UPDATE_STATUS_ERROR, err.message);
  }
};

export default Operation;
