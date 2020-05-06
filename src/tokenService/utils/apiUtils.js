// #############################################################################

export const HTTP_RESPONSE_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

// #############################################################################

// TODO: Test this builder
export const responseBuilder = (
  res,
  { operation, responseCode, errorMessage, body } = { responseCode: 200, body: {} },
) => {
  const operationId = operation && operation.operationId;
  let retBody = {
    ...body,
  };
  if (errorMessage) retBody = { ...retBody, error: errorMessage };
  if (operationId) retBody = { ...retBody, operationId };
  return res
    .status(responseCode)
    .json(retBody)
    .end();
};
