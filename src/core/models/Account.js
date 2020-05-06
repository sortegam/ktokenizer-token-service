import uuid from 'uuid';
import dynogels, { putItemUniqueSafe } from 'core/lib/dynogels';
import cfg from 'config';

// #############################################################################

const Account = dynogels.define(cfg.TABLE_NAMES.ACCOUNTS, {
  hashKey: 'accountId',
  timestamps: true,
  schema: {
    accountId: dynogels.types.uuid(),
  },
});

Account.createUniqueSafeAsync = (data) => {
  const putItemOptions = { regenerateKeyFn: () => uuid() };
  return putItemUniqueSafe(Account, data, putItemOptions);
};

export default Account;
