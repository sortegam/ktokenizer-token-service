import { logger, LOGGER_TYPES } from 'utils/logger';
import OError from 'core/OperationalError';
import { detokenize } from 'core/tokenizer';
import Operation, { OPERATION_TYPES, OPERATION_STATUSES } from 'core/models/Operation';
import { getRequestIPAddress, getAccountIdFromRequest } from 'utils/apiUtils';
import { HTTP_RESPONSE_CODES, responseBuilder } from 'tokenService/utils/apiUtils';

const __l = logger.getLogger(LOGGER_TYPES.TOKEN_SERVICE);

// #############################################################################

const postDetokenize = async (req, res) => {
  __l.debug('API postDetokenize - Called postDetokenize');
  let operation = null;
  try {
    const sourceIP = getRequestIPAddress(req);
    const requestAccountId = getAccountIdFromRequest(req);
    // First thing to do is to create a new operation.
    operation = await Operation.save(OPERATION_TYPES.DETOKENIZE_DATA, requestAccountId, sourceIP);
    __l.debug(`API postDetokenize - createOperation result: ${JSON.stringify(operation)}`);
    // If we have an operation created, then proceed to take token
    const { token } = req.body;
    __l.debug(`API postDetokenize - Token received: ${token}`);
    if (!token) throw new OError(OError.API_TOKEN_PARAM_MISSING);
    // Proceed to detokenize it.
    // Remember that detokenize core method also validates the token
    // throwing up a validation Error (CORE_TOKEN_FORMAT_INVALID) if the
    // token is invalid
    const data = await detokenize(token, requestAccountId);
    operation = await Operation.updateStatus(
      operation,
      OPERATION_STATUSES.SUCCESS,
      'Token found and data decrypted!',
      token,
    );
    __l.debug(`API postDetokenize - updateOperation result: ${JSON.stringify(operation)}`);
    return responseBuilder(res, {
      operation,
      responseCode: HTTP_RESPONSE_CODES.OK,
      body: { data },
    });
  } catch (err) {
    // #############################################################################
    // ### ERROR HANDLING
    // #############################################################################
    let apiErrorMessage = '';
    let httpErrorResponseCode = HTTP_RESPONSE_CODES.BAD_REQUEST;
    switch (err.code) {
      // #############################################################################
      // ### TOKEN PARAM MISSING
      // #############################################################################
      case OError.API_TOKEN_PARAM_MISSING:
        apiErrorMessage = `Missing token parameter (Error code: ${err.code})`;
        break;
      // #############################################################################
      // ### INVALID TOKEN FORMAT
      // #############################################################################
      case OError.CORE_TOKEN_FORMAT_INVALID:
        apiErrorMessage = `Token parameter is invalid or bad formatted (Error code: ${err.code})`;
        break;
      // #############################################################################
      // ### TOKEN NOT FOUND IN THE SYSTEM
      // #############################################################################
      case OError.CORE_TOKEN_DATA_NOT_FOUND:
        apiErrorMessage = `Token not found in the system (Error code: ${err.code})`;
        httpErrorResponseCode = HTTP_RESPONSE_CODES.NOT_FOUND;
        break;
      // #############################################################################
      // ### CATCH ALL ERRORS (GENERIC)
      // #############################################################################
      default:
        apiErrorMessage = `We are experiencing some issues, please try again later. (Error code: ${
          err.code ? err.code : OError.API_GENERIC_ERROR
        })`;
    }
    __l.error(`API postDetokenize:Error - ${err}`);
    if (operation) {
      await Operation.updateStatus(operation, OPERATION_STATUSES.FAILED, apiErrorMessage);
    }
    return responseBuilder(res, {
      operation,
      responseCode: httpErrorResponseCode,
      errorMessage: apiErrorMessage,
    });
  }
};

export default postDetokenize;
