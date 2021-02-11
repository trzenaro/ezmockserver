const Koa = require("koa");
const koaBody = require("koa-body");
const logger = require("koa-logger");
const { server: config } = require("../config/config");
const errorHandler = require("./middlewares/error-handler-middleware");
const mockMiddleware = require("./middlewares/mock-middleware");

const init = () => {
  const app = new Koa();
  app.use(logger());
  app.use(koaBody());
  app.use(errorHandler);
  app.use(mockMiddleware);
  app.listen(config.port, () => console.log(`server running at ${config.port}`));
};

module.exports = {
  init,
};
