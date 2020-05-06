export default {
  STAGE: process.env.KTOKENIZER_STAGE || 'dev',
  LOG_LEVEL: process.env.KTOKENIZER_LOG_LEVEL || 'warn',
  TABLE_NAMES: {
    ENCRYPTED_VAULT: `encryptedvault-${process.env.KTOKENIZER_STAGE}`,
    TOKEN_DATA: `tokendata-${process.env.KTOKENIZER_STAGE}`,
    OPERATIONS: `operations-${process.env.KTOKENIZER_STAGE}`,
    ACCOUNTS: `accounts-${process.env.KTOKENIZER_STAGE}`,
    APIKEYS: `apikeys-${process.env.KTOKENIZER_STAGE}`,
  },
  DYNAMODB_REGION: process.env.KTOKENIZER_DYNAMODB_REGION,
  ENCRYPTED_DATA_HASH_SALT: process.env.KTOKENIZER_ENCRYPTED_DATA_HASH_SALT,
  KMS_KEY_ID: process.env.KTOKENIZER_KMS_KEY_ID,
  KMS_KEY_REGION: process.env.KTOKENIZER_KMS_KEY_REGION,
};
