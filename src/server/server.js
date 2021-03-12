const Koa = require("koa");
const koaBody = require("koa-body");
const logger = require("koa-logger");
const cors = require("@koa/cors");
const { server: config } = require("../config/config");
const errorHandler = require("./middlewares/error-handler-middleware");
const mockMiddleware = require("./middlewares/mock-middleware");

const init = () => {
  return new Promise((resolve) => {
    const app = new Koa();

    app.use(logger());
    app.use(cors());
    app.use(koaBody());
    app.use(errorHandler);
    app.use(mockMiddleware);

    app.listen(config.port, () => {
      console.log(`Server running at ${config.port}`);
      resolve();
    });
  });
};

module.exports = {
  init,
};
