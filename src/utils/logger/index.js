import log4js from 'log4js';
import cfg from 'config';
import * as loggerTypes from './loggerTypes';

log4js.configure({
  appenders: {
    out: { type: 'console' },
  },
  // ----------------------------------------> This is the minimum error level to take
  categories: {
    default: { appenders: ['out'], level: cfg.LOG_LEVEL },
  },
});

export const logger = log4js;
export const LOGGER_TYPES = loggerTypes;
