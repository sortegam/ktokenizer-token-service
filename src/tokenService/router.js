import postTokenServiceTokenizeV1 from 'tokenService/api/v1/tokenService/postTokenize';
import postTokenServiceDetokenizeV1 from 'tokenService/api/v1/tokenService/postDetokenize';
import postTokenServiceValidateV1 from 'tokenService/api/v1/tokenService/postValidate';
import postTokenServiceDeleteV1 from 'tokenService/api/v1/tokenService/postDelete';
import getBackOfficeOperationsV1 from 'tokenService/api/v1/backOffice/getOperations';

export default (appRoute) => {
  // #####################################################
  // ### START ROUTES DEFINITION
  // #####################################################

  appRoute.post('/v1/tokenservice/tokenize', postTokenServiceTokenizeV1);
  appRoute.post('/v1/tokenservice/detokenize', postTokenServiceDetokenizeV1);
  appRoute.post('/v1/tokenservice/delete', postTokenServiceDeleteV1);
  appRoute.post('/v1/tokenservice/validate', postTokenServiceValidateV1);
  appRoute.get('/v1/backoffice/operations', getBackOfficeOperationsV1);

  // #####################################################
  // ### END ROUTES DEFINITION
  // #####################################################
  return appRoute;
};
