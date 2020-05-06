/**
 * Gets an IP from a request (AWS API Gateway)
 * @param {object} Express request
 * @returns an IP string. If an IP couldn't be detected then return ''
 */
export const getRequestIPAddress = (req) => {
  try {
    return req.apiGateway.event.requestContext.identity.sourceIp || '';
  } catch (err) {
    return '';
  }
};

// #############################################################################

/**
 * Gets an accountID from an authorized request (AWS API Gateway)
 * The accountId can come from 2 ways:
 * 1) Cognito Authorizer, the AccountId comes in object
 *    req.apiGateway.event.requestContext.authorizer.claims['cognito:username'].
 * 2) Custom Authorizer, we pass the AccountId as principalId and we can get it from
 *    req.apiGateway.event.requestContext.authorizer.principalId
 * @param {object} Express request
 * @returns The accountId uuid associated to the request if not found returns null.
 */
export const getAccountIdFromRequest = (req) => {
  try {
    return (
      req.apiGateway?.event?.requestContext?.authorizer?.sub ||
      req.apiGateway?.event?.requestContext?.authorizer?.claims?.sub ||
      req.apiGateway?.event?.requestContext?.authorizer?.principalId ||
      null
    );
  } catch (err) {
    return null;
  }
};

// #############################################################################

/**
 * Gets the queryString parameters passed to a request
 * @param {object} Express request
 * @returns An object containing query string parameters if none then return empty object.
 */
export const getParamsFromRequest = (req) => {
  try {
    return req.apiGateway.event.queryStringParameters || {};
  } catch (err) {
    return {};
  }
};
