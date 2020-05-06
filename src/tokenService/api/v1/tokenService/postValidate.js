import { logger, LOGGER_TYPES } from 'utils/logger';
import OError from 'core/OperationalError';
import { verifyToken } from 'core/tokenizer';
import Operation, { OPERATION_TYPES, OPERATION_STATUSES } from 'core/models/Operation';
import { getRequestIPAddress, getAccountIdFromRequest } from 'utils/apiUtils';
import { HTTP_RESPONSE_CODES, responseBuilder } from 'tokenService/utils/apiUtils';

const __l = logger.getLogger(LOGGER_TYPES.TOKEN_SERVICE);

// #############################################################################

const postValidate = async (req, res) => {
  __l.debug('API postValidate - Called postValidate');
  let operation = null;
  try {
    const sourceIP = getRequestIPAddress(req);
    const requestAccountId = getAccountIdFromRequest(req);
    // First thing to do is to create a new operation.
    operation = await Operation.save(OPERATION_TYPES.VALIDATE_TOKEN, requestAccountId, sourceIP);
    __l.debug(`API postValidate - createOperation result: ${JSON.stringify(operation)}`);
    // If we have an operation created, then proceed to take token
    const { token } = req.body;
    __l.debug(`API postValidate - Token received:${token}`);
    if (!token) throw new OError(OError.API_TOKEN_PARAM_MISSING);
    // Proceed to verify the token
    // Remember that verification core method also validates the token
    // throwing up a validation Error (CORE_TOKEN_FORMAT_INVALID) if the
    // token is invalid formatted
    const valid = await verifyToken(token, requestAccountId);
    operation = await Operation.updateStatus(
      operation,
      OPERATION_STATUSES.SUCCESS,
      `Token verification finished [Result ${valid ? 'valid' : 'invalid'}]`,
      token,
    );
    __l.debug(`API postValidate - updateOperation result: ${JSON.stringify(operation)}`);
    return responseBuilder(res, {
      operation,
      responseCode: HTTP_RESPONSE_CODES.OK,
      body: { valid },
    });
  } catch (err) {
    // #############################################################################
    // ### ERROR HANDLING
    // #############################################################################
    let apiErrorMessage = '';
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
      // ### CATCH ALL ERRORS (GENERIC)
      // #############################################################################
      default:
        apiErrorMessage = `We are experiencing some issues, please try again later. (Error code: ${
          err.code ? err.code : OError.API_GENERIC_ERROR
        })`;
    }
    __l.error(`API postValidate:Error ${err}`);
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

export default postValidate;
