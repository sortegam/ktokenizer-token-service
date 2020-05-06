import axios from 'axios'; // eslint-disable-line
import ENDPOINTS from './constants/endpoints';

describe('Unauthorized Request with no authorization header', () => {
  Object.values(ENDPOINTS).forEach((endpoint) => {
    it(`should get 401 status code when trying to call [${endpoint.method}]->[${
      endpoint.url
    }]`, async () => {
      try {
        await axios({
          method: endpoint.method,
          url: endpoint.url,
        });
      } catch (e) {
        expect(e.response.status).toEqual(401);
      }
    });
  });
});

describe('Unauthorized Request with authorization header empty', () => {
  Object.values(ENDPOINTS).forEach((endpoint) => {
    it(`should get 401 status code when trying to call [${endpoint.method}]->[${
      endpoint.url
    }]`, async () => {
      try {
        await axios({
          method: endpoint.method,
          url: endpoint.url,
          headers: {
            Authorization: '',
          },
        });
      } catch (e) {
        expect(e.response.status).toEqual(401);
      }
    });
  });
});

describe('Unauthorized Request with authorization header with incorrect BEARER', () => {
  Object.values(ENDPOINTS).forEach((endpoint) => {
    it(`should get 401 status code when trying to call [${endpoint.method}]->[${
      endpoint.url
    }]`, async () => {
      try {
        await axios({
          method: endpoint.method,
          url: endpoint.url,
          headers: {
            Authorization: 'BEARER this_is_a_dummy_bearer_1234567890987654321',
          },
        });
      } catch (e) {
        expect(e.response.status).toEqual(401);
      }
    });
  });
});
