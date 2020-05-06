---

## SCAN ALL THE DATA IN A TABLE

var params = {
TableName: 'vault',
};
dynamodb.scan(params, function(err, data) {
if (err) ppJson(err); // an error occurred
else ppJson(data); // successful response
});

---

## QUERY A TOKEN IN A TABLE

var params = {
TableName: 'vault',
KeyConditionExpression: '#token = :value', // a string representing a constraint on the attribute
ExpressionAttributeNames: { '#token': "token" },
ExpressionAttributeValues: { // a map of substitutions for all attribute values
':value': '73f95993-d120-4cb9-ad8e-b8bb6ccbf50c',
},
};
docClient.query(params, function(err, data) {
if (err) ppJson(err); // an error occurred
else ppJson(data); // successful response
});3
