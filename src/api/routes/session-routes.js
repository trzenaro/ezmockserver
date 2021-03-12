const Router = require("koa-router");
const sessionController = require("../controllers/session-controller");

const sessionRouter = new Router();
sessionRouter.get("/sessions", sessionController.getSessions);
sessionRouter.post("/sessions/current", sessionController.activateSession);
sessionRouter.delete("/sessions/current", sessionController.deactivateCurrentSession);
sessionRouter.get("/sessions/current", sessionController.getCurrentSession);
sessionRouter.post("/sessions", sessionController.addSessions);
sessionRouter.get("/session/:sessionName", sessionController.downloadSession);

module.exports = sessionRouter;
