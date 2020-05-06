import { logger, LOGGER_TYPES } from 'utils/logger';
import OError from 'core/OperationalError';
import { ENCRYPT_MAX_DATA_LENGTH, tokenize } from 'core/tokenizer';
import Operation, { OPERATION_TYPES, OPERATION_STATUSES } from 'core/models/Operation';
import { getRequestIPAddress, getAccountIdFromRequest } from 'utils/apiUtils';
import { HTTP_RESPONSE_CODES, responseBuilder } from 'tokenService/utils/apiUtils';
import { isDataEmpty } from 'core/utils/helpers';

const __l = logger.getLogger(LOGGER_TYPES.TOKEN_SERVICE);

// #############################################################################

const postTokenize = async (req, res) => {
  __l.debug('API postTokenize - Called postTokenize');
  let operation = null;
  try {
    const sourceIP = getRequestIPAddress(req);
    const requestAccountId = getAccountIdFromRequest(req);
    // First thing to do is to create a new operation.
    operation = await Operation.save(OPERATION_TYPES.TOKENIZE_DATA, requestAccountId, sourceIP);
    __l.debug(`API postTokenize - createOperation result: ${JSON.stringify(operation)}`);
    // If we have an operation created, then proceed to take the data from body
    const { data } = req.body;
    if (isDataEmpty(data)) {
      throw new OError(OError.API_DATA_PARAM_MISSING);
    }
    __l.trace(`API postTokenize - Data captured: ${data}`);
    // Proceed to tokenize it.
    const token = await tokenize(data, requestAccountId);
    __l.debug(`API postTokenize - tokenize fn -> token generated: ${token}`);
    if (!token) throw new OError(OError.API_DATA_POST_TOKENIZE_ERROR);
    operation = await Operation.updateStatus(
      operation,
      OPERATION_STATUSES.SUCCESS,
      'Data saved and token generated',
      token,
    );
    __l.debug(`API postTokenize - updateOperation result: ${JSON.stringify(operation)}`);
    return responseBuilder(res, {
      operation,
      responseCode: HTTP_RESPONSE_CODES.OK,
      body: { token },
    });
  } catch (err) {
    // #############################################################################
    // ### ERROR HANDLING
    // #############################################################################
    let apiErrorMessage = '';
    switch (err.code) {
      // #############################################################################
      // ### DATA EMPTY
      // #############################################################################
      case OError.API_DATA_PARAM_MISSING:
        apiErrorMessage = `The data parameter passed is empty or missing. (Error code: ${
          err.code
        })`;
        break;
      // #############################################################################
      // ### DATA MAX LENGTH REACHED
      // #############################################################################
      case OError.CORE_KMS_ENCRYPT_MAX_DATA_LENGTH_REACHED:
        apiErrorMessage = `The data parameter exceeded the maximum permitted length (${ENCRYPT_MAX_DATA_LENGTH} bytes). (Error code: ${
          err.code
        })`;
        break;
      // #############################################################################
      // ### CATCH ALL ERRORS (GENERIC)
      // #############################################################################
      default:
        apiErrorMessage = `We are experiencing some issues, please try again later. (Error code: ${
          err.code ? err.code : OError.API_GENERIC_ERROR
        })`;
    }
    __l.error(`API postTokenize:Error - ${err}`);
    if (operation) {
      await Operation.updateStatus(operation, OPERATION_STATUSES.FAILED, apiErrorMessage);
    }
    return responseBuilder(res, {
      operation,
      responseCode: HTTP_RESPONSE_CODES.BAD_REQUEST,
      errorMessage: apiErrorMessage,
    });
  }
};

export default postTokenize;
