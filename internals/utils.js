const fs = require('fs');
const replace = require('replace-in-file');

const getAvailableStages = () =>
  fs
    .readdirSync('.')
    .filter(file => /^\.env-.*/i.test(file)) // Get the .env-* files
    .map(file => file.replace('.env-', '')); // Remove env- to get only the env tag

/**
 * It tries to replace or add new setting to an ENV file
 */
const setVarInEnvFile = (envFile, key, value) => {
  const replaceOptions = {
    files: envFile,
    from: new RegExp(`^${key}.*`, 'g'),
    to: `${key}=${value}`,
  };
  const result = replace.sync(replaceOptions);
  // That means that no replacing ocurred.
  if (result.length === 0) {
    fs.appendFileSync(envFile, `${key}=${value}\n`);
  }
};

module.exports = {
  getAvailableStages,
  setVarInEnvFile,
};
