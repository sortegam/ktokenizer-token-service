import sha256 from 'hash.js/lib/hash/sha/256';
import cfg from 'config';
import _isEmpty from 'lodash/isEmpty';
import _isObject from 'lodash/isObject';
import _isArray from 'lodash/isArray';

// #############################################################################

export const isDataEmpty = (data) => {
  if (typeof data === 'number') {
    return false;
  }
  if (_isEmpty(data)) {
    return true;
  }
  return !data;
};

// #############################################################################

/**
 * Given a data gets a SHA256 Checksum
 * @param {any} could be object / string / number / array / etc
 */
export const getDataHash = (data, salt = cfg.ENCRYPTED_DATA_HASH_SALT) => {
  if (isDataEmpty(data)) {
    return null;
  }
  let str = data.toString();
  if (_isObject(data) || _isArray(data)) {
    str = JSON.stringify(data);
  }
  return sha256()
    .update(`${str}${salt}`)
    .digest('hex');
};

// #############################################################################

export const getDataLength = data => JSON.stringify(data).toString().length;
