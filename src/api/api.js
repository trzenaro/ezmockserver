const Koa = require("koa");
const koaBody = require("koa-body");
const logger = require("koa-logger");
const cors = require("@koa/cors");
const { api: config } = require("../config/config");
const errorHandler = require("./middlewares/error-handler-middleware");
const sessionRoutes = require("./routes/session-routes");

const init = () => {
  return new Promise((resolve) => {
    const app = new Koa();

    app.use(logger());
    app.use(cors());
    app.use(koaBody({ multipart: true }));
    app.use(errorHandler);
    app.use(sessionRoutes.routes());

    app.listen(config.port, () => {
      console.log(`API running at ${config.port}`);
      resolve();
    });
  });
};

module.exports = {
  init,
};
