/**
 * Token Service Authorizer Function
 */

import { logger, LOGGER_TYPES } from 'utils/logger';
import ApiKey, { PERMISSIONS } from 'core/models/ApiKey';

const __l = logger.getLogger(LOGGER_TYPES.AUTHORIZER);

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = { principalId };
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

// #############################################################################

const getApiKeyData = async (apiKey) => {
  try {
    __l.trace(`tokenServiceAuthorizer - The APIKey passed: ${apiKey}`);
    const apiKeyData = await ApiKey.getAsync(apiKey);
    if (!apiKeyData) {
      __l.info('tokenServiceAuthorizer - The APIKey passed was not found in the system.');
      return null;
    }
    const { attrs: data } = apiKeyData;
    return data;
  } catch (err) {
    __l.error(`tokenServiceAuthorizer - ${JSON.stringify(err)}`);
    throw err;
  }
};

// #############################################################################

const getApiKeyFromAuthHeader = (authHeader) => {
  if (authHeader && typeof authHeader === 'string') {
    return authHeader
      .toString()
      .replace(/^bearer /i, '')
      .trim();
  }
  return null;
};

// #############################################################################

/**
 *
 * We have to make this ugly function to get both authorization capitalized and
 * non capitalized since serverless-offline plugin is not working properly atm.
 * @param {object} event
 */
// TODO: Remove this ugly function when serverless fix the capizalization of authentication header :-)
const getAuthHeaderFromEvent = (event) => {
  if (event.headers.Authorization) {
    return event.headers.Authorization;
  }
  if (event.headers.authorization) {
    return event.headers.authorization;
  }
  return null;
};

// ############### MAIN ########################################################

export const handler = async (event, context, callback) => {
  try {
    const authHeader = getAuthHeaderFromEvent(event);
    if (!/^Bearer /.test(authHeader)) {
      __l.warn('tokenServiceAuthorizer - Bearer on Authorization Header not found');
      callback('Unauthorized');
      return;
    }
    const apiKey = getApiKeyFromAuthHeader(authHeader);
    __l.trace(`tokenServiceAuthorizer - ApiKey sent ${apiKey}`);
    if (!apiKey) {
      callback('Unauthorized');
      return;
    }
    const apiKeyData = await getApiKeyData(apiKey);
    __l.trace(`tokenServiceAuthorizer - ApiKey DB Data obtained ${apiKeyData}`);

    // APIKey not found
    if (!apiKeyData) {
      callback('Unauthorized');
      return;
    }
    // Check permissions we adopt a Deny by default policy for security
    const { permissions: apiKeyPermissions } = apiKeyData;
    if (!apiKeyPermissions) {
      throw new Error('No permissions object detected');
    }

    const { path, httpMethod } = event;
    const methodPath = `${httpMethod} ${path}`;

    let allowExecution = false;

    // #############################################################################
    // ### IP RULES PERMISSION CHECK
    // #############################################################################
    if (apiKeyPermissions[PERMISSIONS.ENABLED_IP_FILTERING]) {
      __l.debug('tokenServiceAuthorizer - IP Filtering Enabled :-)');
      let allowIPFiltering = false;
      const IPWhitelist = apiKeyPermissions[PERMISSIONS.IP_WHITELIST];
      if (IPWhitelist && IPWhitelist.length > 0) {
        const sourceIp =
          event.requestContext &&
          event.requestContext.identity &&
          event.requestContext.identity.sourceIp;
        if (sourceIp) {
          __l.info(`tokenServiceAuthorizer - Source IP Detected ${sourceIp}`);
          allowIPFiltering = IPWhitelist.some(ip => ip.toString() === sourceIp.toString());
        }
        __l.warn('tokenServiceAuthorizer - Unable to get sourceIp :-(');
      }
      // If the IP detected is not whitelisted, reject the request.
      if (!allowIPFiltering) {
        callback('Unauthorized');
        return;
      }
    }
    // #############################################################################
    // ### ROUTE / FEATURE PERMISSION CHECK
    // #############################################################################
    if (methodPath === 'POST /v1/tokenservice/tokenize') {
      allowExecution = Boolean(apiKeyPermissions[PERMISSIONS.CAN_TOKENIZE]);
    }
    if (methodPath === 'POST /v1/tokenservice/detokenize') {
      allowExecution = Boolean(apiKeyPermissions[PERMISSIONS.CAN_DETOKENIZE]);
    }
    if (methodPath === 'POST /v1/tokenservice/validate') {
      allowExecution = Boolean(apiKeyPermissions[PERMISSIONS.CAN_VALIDATE_TOKEN]);
    }
    if (methodPath === 'POST /v1/tokenservice/delete') {
      allowExecution = Boolean(apiKeyPermissions[PERMISSIONS.CAN_DELETE_TOKEN]);
    }
    // #############################################################################
    // ### ALLOW / DENY THE EXECUTION
    // #############################################################################
    if (allowExecution) {
      callback(null, generatePolicy(apiKeyData.accountId, 'Allow', event.methodArn));
    } else {
      callback('Unauthorized');
    }
  } catch (err) {
    __l.error(`tokenServiceAuthorizer - Raised an error: ${err}`);
    callback('Unauthorized');
  }
};
