const logger = require('../../utils/light-logger');

const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    logger.error(error);
    ctx.status = 500;
  }
};

module.exports = errorHandler;
