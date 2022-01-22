const config = require("../config/config");

const levels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const debug = (...args) => {
  if (levels.DEBUG >= levels[config.logLevel]) console.debug(...args);
};

const warn = (...args) => {
  if (levels.WARN >= levels[config.logLevel]) console.warn(...args);
};

const info = (...args) => {
  if (levels.INFO >= levels[config.logLevel]) console.info(...args);
};

const error = (...args) => {
  if (levels.ERROR >= levels[config.logLevel]) console.error(...args);
};


module.exports = {
  debug,
  warn,
  info,
  error
}