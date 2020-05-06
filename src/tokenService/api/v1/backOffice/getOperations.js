import { logger, LOGGER_TYPES } from 'utils/logger';
import Operation from 'core/models/Operation';
import { getAccountIdFromRequest, getParamsFromRequest } from 'utils/apiUtils';
import { HTTP_RESPONSE_CODES, responseBuilder } from 'tokenService/utils/apiUtils';
import OError from 'core/OperationalError';

const __l = logger.getLogger(LOGGER_TYPES.TOKEN_SERVICE);

// #############################################################################

const getOperations = async (req, res) => {
  __l.debug('API Called backoffice / getOperations');
  let operations = null;
  try {
    const requestAccountId = getAccountIdFromRequest(req);
    const reqParams = getParamsFromRequest(req);
    operations = await Operation.getAllFiltered({ accountId: requestAccountId, filter: reqParams });
    __l.debug(`API backoffice / getOperations - result: ${operations}`);
    return responseBuilder(res, {
      responseCode: HTTP_RESPONSE_CODES.OK,
      body: operations,
    });
  } catch (err) {
    // #############################################################################
    // ### ERROR HANDLING
    // #############################################################################
    let apiErrorMessage = '';
    switch (err.code) {
      // #############################################################################
      // ### INVALID PARAMS GETTING OPERATIONS
      // #############################################################################
      case OError.CORE_OPERATIONS_GET_PARAM_INVALID:
        apiErrorMessage = err.message;
        break;
      // #############################################################################
      // ### CATCH ALL ERRORS (GENERIC)
      // #############################################################################
      default:
        apiErrorMessage = `We are experiencing some issues, please try again later. (Error code: ${
          err.code ? err.code : OError.API_GENERIC_ERROR
        })`;
    }
    __l.info(`API backoffice / getOperations:Error ${err}`);
    return responseBuilder(res, {
      responseCode: HTTP_RESPONSE_CODES.BAD_REQUEST,
      errorMessage: apiErrorMessage,
    });
  }
};

export default getOperations;
