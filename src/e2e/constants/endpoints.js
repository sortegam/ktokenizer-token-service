// const ENDPOINT_TO_TEST = 'https://secure-test.ktokenizer.com';
const ENDPOINT_TO_TEST = process.env.KTOKENIZER_ENDPOINT || 'http://localhost:3000';

export default {
  TOKENIZE: { method: 'POST', url: `${ENDPOINT_TO_TEST}/v1/tokenservice/tokenize` },
  DETOKENIZE: { method: 'POST', url: `${ENDPOINT_TO_TEST}/v1/tokenservice/detokenize` },
  VALIDATE: { method: 'POST', url: `${ENDPOINT_TO_TEST}/v1/tokenservice/validate` },
  DELETE: { method: 'POST', url: `${ENDPOINT_TO_TEST}/v1/tokenservice/delete` },
  GET_OPERATIONS: { method: 'GET', url: `${ENDPOINT_TO_TEST}/v1/backoffice/operations` },
};
