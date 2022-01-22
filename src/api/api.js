const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const Koa = require("koa");
const koaBody = require("koa-body");
const koaLogger = require("koa-logger");
const cors = require("@koa/cors");
const { api: config } = require("../config/config");
const errorHandler = require("./middlewares/error-handler-middleware");
const sessionRoutes = require("./routes/session-routes");
const buildResolver = require("../utils/build-resolver");
const logger = require('../utils/light-logger');

const init = () => {
  return new Promise(async (resolve) => {
    const app = new Koa();
    const appCallback = app.callback();

    app.use(koaLogger());
    app.use(cors());
    app.use(koaBody({ multipart: true }));
    app.use(errorHandler);
    app.use(sessionRoutes.routes());

    if (!config.httpPort && !config.httpsPort) {
      throw new Error("api.httpPort or api.httpsPort must be provided");
    }

    const resolver = buildResolver(resolve);

    if (config.httpPort) {
      resolver.addOne();
      const httpServer = http.createServer(appCallback);
      httpServer.listen(config.httpPort, () => {
        logger.info(`HTTP API running at ${config.httpPort}`);
        resolver.resolveOne();
      });
    }

    if (config.httpsPort) {
      resolver.addOne();
      const httpsServer = https.createServer(
        {
          cert: fs.readFileSync(path.join(__dirname, "..", "..", "certs", "localhost.crt")),
          key: fs.readFileSync(path.join(__dirname, "..", "..", "certs", "localhost.key")),
        },
        appCallback,
      );
      httpsServer.listen(config.httpsPort, () => {
        logger.info(`HTTPS API running at ${config.httpsPort}`);
        resolver.resolveOne();
      });
    }
  });
};

module.exports = {
  init,
};
