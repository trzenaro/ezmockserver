const Router = require("koa-router");
const proxyController = require("../controllers/proxy-controller");

const proxyRouter = new Router();
proxyRouter.get("/proxy/sessions", proxyController.getSessions);
proxyRouter.get("/proxy/sessions/:sessionName", proxyController.downloadSession);

module.exports = proxyRouter;
