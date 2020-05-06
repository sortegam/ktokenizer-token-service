import { logger, LOGGER_TYPES } from 'utils/logger';
import OError from 'core/OperationalError';
import Operation, { OPERATION_TYPES, OPERATION_STATUSES } from 'core/models/Operation';
import { deleteToken } from 'core/tokenizer';
import { getRequestIPAddress, getAccountIdFromRequest } from 'utils/apiUtils';
import { HTTP_RESPONSE_CODES, responseBuilder } from 'tokenService/utils/apiUtils';

const __l = logger.getLogger(LOGGER_TYPES.TOKEN_SERVICE);

// #############################################################################

const postDelete = async (req, res) => {
  __l.debug('API postDelete - Called postDelete');
  let operation = null;
  try {
    const sourceIP = getRequestIPAddress(req);
    const requestAccountId = getAccountIdFromRequest(req);
    // First thing to do is to create a new operation.
    operation = await Operation.save(OPERATION_TYPES.DELETE_TOKEN, requestAccountId, sourceIP);
    __l.debug(`API postDelete - createOperation result: ${JSON.stringify(operation)}`);
    // If we have an operation created, then proceed to take token
    const { token } = req.body;
    __l.debug(`API postDelete - Token received: ${token}`);
    if (!token) throw new OError(OError.API_TOKEN_PARAM_MISSING);
    // Proceed to delete it.
    // Remember that deleteDataByToken core method also validates the token
    // throwing up a validation Error (CORE_TOKEN_FORMAT_INVALID) if the
    // token is invalid
    await deleteToken(token, requestAccountId);
    operation = await Operation.updateStatus(
      operation,
      OPERATION_STATUSES.SUCCESS,
      'Token and data associated were deleted!',
      token,
    );
    __l.debug(`API postDelete - updateOperation result: ${JSON.stringify(operation)}`);
    return responseBuilder(res, {
      operation,
      responseCode: HTTP_RESPONSE_CODES.OK,
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
      // ### TOKEN NOT FOUND IN DATABASE
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
    if (operation) {
      await Operation.updateStatus(operation, OPERATION_STATUSES.FAILED, apiErrorMessage);
    }
    __l.error(`API postDelete:Error - ${err}`);
    return responseBuilder(res, {
      operation,
      responseCode: httpErrorResponseCode,
      errorMessage: apiErrorMessage,
    });
  }
};

export default postDelete;
