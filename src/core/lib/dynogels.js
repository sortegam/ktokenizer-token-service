import dynogels from 'dynogels-promisified';
import AWS from 'aws-sdk';
import cfg from 'config';

// #############################################################################

const dynamoDBConfig = {
  region: cfg.DYNAMODB_REGION,
};

// We do this because we want to force DynamoLocal on dev stage.
if (cfg.STAGE === 'dev' || cfg.STAGE === 'development') {
  dynamoDBConfig.endpoint = 'http://localhost:8000';
}

// Configure DynamoDB
dynogels.dynamoDriver(new AWS.DynamoDB(dynamoDBConfig));

// #############################################################################

/**
 * Since dynamodb is a key/value storage, the creation of a new item with the same
 * hash key is going to overwrite the previous item.
 * So, this function ensures that a previous item never is going to be overwritten
 * at the same time if the primary key is uuid based it will regenerate the uuid
 * and try to insert the item again until MAX_RETRY_TIMES reached
 * an item
 * NOTE: Yes. That could sound a little dumb since there is almost no chance for
 *       an UUID to collide. But we need to do our best to keep our system consistent.
 * @param {object} Model object from dynogels
 * @param {object} Model Data
 * @param {function} regenerateKeyFn If a function then tries to regenerate the primary key
 * @param {integer} Number of retries left, by default 3
 *                  to regenerate uuid primary key and perform another insert
 *                  as many times as RETRY_TIMES
 */
export const putItemUniqueSafe = async (model, data, { regenerateKeyFn = null, retries = 3 }) => {
  if (!model) {
    throw new Error('putItemUniqueSafe: No modal parameter passed');
  }
  const modelHashKey = model.schema.hashKey;
  try {
    return await model.createAsync(data, { overwrite: false });
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      if (typeof regenerateKeyFn === 'function' && retries > 0) {
        const newData = { ...data, [modelHashKey]: regenerateKeyFn(data) };
        return putItemUniqueSafe(model, newData, { regenerateKeyFn, retries: retries - 1 });
      }
      throw new Error('putItemUniqueSafe: The primary key already exists in database');
    } else {
      throw new Error('putItemUniqueSafe unable to put the item into database');
    }
  }
};

export default dynogels;
