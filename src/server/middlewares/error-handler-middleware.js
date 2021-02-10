const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error(error);
    ctx.status = 500;
  }
};
module.exports = errorHandler;
