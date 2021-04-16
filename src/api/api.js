const Koa = require("koa");
const koaBody = require("koa-body");
const logger = require("koa-logger");
const cors = require("@koa/cors");
const config = require("../config/config");
const errorHandler = require("./middlewares/error-handler-middleware");
const sessionRoutes = require("./routes/session-routes");
const sessionService = require("./services/session-service");

const init = () => {
  return new Promise(async (resolve) => {
    const app = new Koa();

    app.use(logger());
    app.use(cors());
    app.use(koaBody({ multipart: true }));
    app.use(errorHandler);
    app.use(sessionRoutes.routes());

    app.listen(config.api.port, async () => {
      if (config.defaultSession) {
        await sessionService.activateSession(config.defaultSession);
      }
      console.log(`API running at ${config.api.port}`);
      resolve();
    });
  });
};

module.exports = {
  init,
};
