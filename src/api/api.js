const Koa = require("koa");
const koaBody = require("koa-body");
const logger = require("koa-logger");
const { api: config } = require("../config/config");
const errorHandler = require("./middlewares/error-handler-middleware");
const sessionRoutes = require("./routes/session-routes");

const init = () => {
  const app = new Koa();

  app.use(logger());
  app.use(koaBody({ multipart: true }));
  app.use(errorHandler);
  app.use(sessionRoutes.routes());

  app.listen(config.port, () => console.log(`api running at ${config.port}`));
};

module.exports = {
  init,
};
