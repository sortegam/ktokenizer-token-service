var AWS = require('aws-sdk');
var fs = require('fs');
var faker = require('faker');
var _sample = require('lodash/sample');
var _random = require('lodash/random');

AWS.config.update({
  region: 'local',
  endpoint: 'http://localhost:8000',
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log('Importing orders into DynamoDB. Please wait.');

var data = [];

for (var i = 0; i <= 1000; i++) {
  var accountId = '1bcdb17f-35e4-4421-b1a5-810d50b73ecc';
  if (i > 500) accountId = '1bcdb17f-35e4-4421-b1a5-810d50b73ecc';
  if (i > 1000) accountId = '54173f6b-cafa-4cf9-9ff6-333333333333';

  data.push({
    accountId: accountId,
    operationId: faker.random.uuid(),
    tokenRelated: faker.random.uuid(),
    type: _sample(['tokenize_data', 'detokenize_data', 'delete_token', 'validate_token']),
    currentStatus: _sample(['requested', 'success', 'failed']),
    requestIPAddress: faker.internet.ip(),
    createdAt: `2018-0${_random(1, 9)}-${_random(11, 26)}T20:04:43.000Z`,
    historicStatus: [],
  });
}

data.forEach(function(item) {
  var params = {
    TableName: 'operations-dev',
    Item: item,
  };

  docClient.put(params, function(err, data) {
    if (err) {
      console.error('Unable to add item', '. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('PutItem succeeded:', item.operationId);
    }
  });
});
