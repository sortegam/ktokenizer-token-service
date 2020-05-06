import { KMS } from 'aws-sdk';
import cfg from 'config';
import { isDataEmpty, getDataLength } from 'core/utils/helpers';
import _isString from 'lodash/isString';
import OError from 'core/OperationalError';

// #############################################################################
// ### Constants
// #############################################################################

// This is the max KMS string length that AWS KMS supports.
const MAX_KMS_STRING_LENGTH = 4096;
// This is the maximum data length we allow to store in our system before raising an error
// we take these 96 bytes to save some information about the data stored
export const ENCRYPT_MAX_DATA_LENGTH = MAX_KMS_STRING_LENGTH - 96;

export const ENCRYPT_TYPES = {
  STANDARD: 'standard',
  BASE64: 'base64',
};

const DATA_TYPES = {
  OBJECT: 'object',
  STRING: 'string',
  NUMBER: 'number',
};

// #############################################################################
// ### KMS Setup
// #############################################################################

const kmsConfig = {
  region: cfg.KMS_KEY_REGION,
};
const kmsInstance = new KMS(kmsConfig);

// #############################################################################
// ### MAIN
// #############################################################################

/**
 * It encrypts a string / object / number using KMS
 * @param {string} data string to encrypt
 * @param {string} outputType if 'base64' return base64 string else standard output
 */
export const encrypt = async (data, outputType = ENCRYPT_TYPES.STANDARD) => {
  if (isDataEmpty(data)) {
    throw new OError(OError.CORE_KMS_ENCRYPT_DATA_MISSING);
  }
  if (getDataLength(data) > ENCRYPT_MAX_DATA_LENGTH) {
    throw new OError(OError.CORE_KMS_ENCRYPT_MAX_DATA_LENGTH_REACHED);
  }
  const storeData = {
    data,
    type: typeof data, // store the type
  };
  const plainTextBuffer = Buffer.from(JSON.stringify(storeData), 'utf8');
  const encryptParams = { KeyId: cfg.KMS_KEY_ID, Plaintext: plainTextBuffer };
  try {
    const encryptedData = await kmsInstance.encrypt(encryptParams).promise();
    switch (outputType) {
      case ENCRYPT_TYPES.BASE64:
        return encryptedData.CiphertextBlob.toString('base64');
      default:
        return encryptedData.CiphertextBlob.toString();
    }
  } catch (err) {
    throw new OError(
      OError.CORE_KMS_ENCRYPT_ERROR,
      `Problem encrypting data with KMS (${err.message})`,
    );
  }
};

// #############################################################################

/**
 * It decrypts a Ciphertext string using KMS
 * @param {string} input ecrypted string to decrypt
 * @param {string} inputType if 'base64' treat string as base64 else standard ciphertext input
 */
export const decrypt = async (ciphertext, inputType = ENCRYPT_TYPES.STANDARD) => {
  let binaryBlob = ciphertext;
  if (inputType === ENCRYPT_TYPES.BASE64) {
    if (!_isString(ciphertext)) {
      throw new OError(
        OError.CORE_KMS_DECRYPT_CIPHERTEXT_NOT_BASE64_ERROR,
        'Ciphertext param is not a base64 string',
      );
    }
    binaryBlob = Buffer.from(ciphertext, 'base64');
  }
  const decryptParams = {
    CiphertextBlob: binaryBlob,
  };
  try {
    const decryptedDataBuffer = await kmsInstance.decrypt(decryptParams).promise();
    const jsonString = decryptedDataBuffer.Plaintext.toString('utf8');
    const obj = JSON.parse(jsonString);
    switch (obj.type) {
      case DATA_TYPES.NUMBER:
        return Number(obj.data);
      case DATA_TYPES.OBJECT:
      case DATA_TYPES.STRING:
      default:
        return obj.data;
    }
  } catch (err) {
    throw new OError(
      OError.CORE_KMS_DECRYPT_ERROR,
      `Problem decrypting data with KMS (${err.message})`,
    );
  }
};
