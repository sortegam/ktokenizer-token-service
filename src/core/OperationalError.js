/**
 * OPERATIONAL ERROR CLASS
 */

class OError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
// #############################################################################
// ### API ERRORS
// #############################################################################
OError.API_GENERIC_ERROR = 1;
OError.API_DATA_PARAM_MISSING = 30;
OError.API_TOKEN_PARAM_MISSING = 31;
OError.API_OPERATION_PARAM_MISSING = 32;
OError.API_OPERATION_UNKNOWN = 40;
// #############################################################################
// ### CORE:OPERATIONS ERRORS
// #############################################################################
OError.CORE_OPERATION_CREATE_ERROR = 100;
OError.CORE_OPERATION_UPDATE_STATUS_ERROR = 101;
OError.CORE_OPERATIONS_GET_STATUS_ERROR = 102;
OError.CORE_OPERATIONS_GET_PARAM_INVALID = 103;
// #############################################################################
// ### CORE:KMS ERRORS
// #############################################################################
OError.CORE_KMS_ENCRYPT_ERROR = 400;
OError.CORE_KMS_DECRYPT_ERROR = 401;
OError.CORE_KMS_ENCRYPT_DATA_MISSING = 402;
OError.CORE_KMS_DECRYPT_CIPHERTEXT_NOT_BASE64_ERROR = 403;
OError.CORE_KMS_ENCRYPT_MAX_DATA_LENGTH_REACHED = 410;
// #############################################################################
// ### CORE:TOKENIZER ERRORS
// #############################################################################
OError.CORE_TOKENDATA_CREATE_ERROR = 500;
OError.CORE_ENCRYPTED_VAULT_DATA_CREATE_ERROR = 501;
OError.CORE_TOKEN_FORMAT_INVALID = 502;
OError.CORE_DATA_PARAM_MISSING = 503;
OError.CORE_TOKEN_DATA_NOT_FOUND = 520;
OError.CORE_TOKEN_DATA_QUERY_ERROR = 521;
OError.CORE_ENCRYPTED_VAULT_GET_ONE_BY_VAULT_ID_ERROR = 522;
OError.CORE_ENCRYPTED_VAULT_DATA_NOT_FOUND = 523;
OError.CORE_DELETE_ENCRYPTED_VAULT_ERROR = 524;

export default OError;
