/* eslint-disable */

/**
 * This run a full test scenario with the tokenizator.
 * It runs tokenization, detokeniation, validation, delete and get operations
 */

import axios from 'axios'; // eslint-disable-line
import ENDPOINTS from './constants/endpoints';

const VALID_API_KEY = process.env.KTOKENIZER_APIKEY || '222222';

const isValidUUID = uuid =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);

describe('Full success flow scenario', () => {
  let generatedToken = '';
  it('should tokenize / detokenize / validate / delete', async done => {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${VALID_API_KEY}`,
    };
    const dataToTokenize = {
      pan: '4402687819070509',
      expiry_month: 11,
      expiry_year: 2022,
      card_holder: 'John Doe',
    };
    // #############################################################################
    // ### TOKENIZING
    // #############################################################################
    console.log('Tokenizing some dummy data...');
    const tokenizeResponse = await axios({
      method: ENDPOINTS.TOKENIZE.method,
      url: ENDPOINTS.TOKENIZE.url,
      data: { data: dataToTokenize },
      headers,
    });
    generatedToken = tokenizeResponse.data.token;
    console.log('Validating token obtained...');
    expect(isValidUUID(generatedToken)).toEqual(true);
    // #############################################################################
    // ### DETOKENIZING
    // #############################################################################
    console.log(`Detokenizing token...[${generatedToken}]`);
    const detokenizeResponse = await axios({
      method: ENDPOINTS.DETOKENIZE.method,
      url: ENDPOINTS.DETOKENIZE.url,
      data: {
        token: generatedToken,
      },
      headers,
    });
    console.log('Validating detokenization result...');
    expect(detokenizeResponse.data.data).toEqual(dataToTokenize);
    expect(isValidUUID(detokenizeResponse.data.operationId)).toEqual(true);
    // #############################################################################
    // ### VALIDATING
    // #############################################################################
    console.log(`Validating token...[${generatedToken}]`);
    const validationResponse = await axios({
      method: ENDPOINTS.VALIDATE.method,
      url: ENDPOINTS.VALIDATE.url,
      data: {
        token: generatedToken,
      },
      headers,
    });
    console.log('Validating validation result...');
    expect(validationResponse.data.valid).toEqual(true);
    expect(isValidUUID(validationResponse.data.operationId)).toEqual(true);
    // #############################################################################
    // ### DELETING
    // #############################################################################
    console.log(`Deleting token...[${generatedToken}]`);
    const deletionResponse = await axios({
      method: ENDPOINTS.DELETE.method,
      url: ENDPOINTS.DELETE.url,
      data: {
        token: generatedToken,
      },
      headers,
    });
    console.log('Validating deletion result...');
    expect(isValidUUID(deletionResponse.data.operationId)).toEqual(true);
    // #############################################################################
    // ### CHECK THAT TOKEN IS INVALID BECAUSE WE DELETED IT
    // #############################################################################
    console.log(`Validating that the token is invalid (deleted)...[${generatedToken}]`);
    const validateDeletionResponse = await axios({
      method: ENDPOINTS.VALIDATE.method,
      url: ENDPOINTS.VALIDATE.url,
      data: {
        token: generatedToken,
      },
      headers,
    });
    console.log('Validating deletion result...');
    expect(validateDeletionResponse.data.valid).toEqual(false);
    expect(isValidUUID(validateDeletionResponse.data.operationId)).toEqual(true);
    // #############################################################################
    // ### CHECK THAT TOKEN IS DELETED WE CAN NOT DETOKENIZE
    // #############################################################################
    console.log(`Validating that a deleted token can't be detokenized ...[${generatedToken}]`);
    try {
      await axios({
        method: ENDPOINTS.DETOKENIZE.method,
        url: ENDPOINTS.DETOKENIZE.url,
        data: {
          token: generatedToken,
        },
        headers,
      });
    } catch (e) {
      console.log('Validating detokenization (deleted token) result...');
      expect(e.response.status).toEqual(404);
      done();
    }
  });
});
