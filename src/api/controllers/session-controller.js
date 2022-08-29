const sessionService = require("../services/session-service");

const getSessions = async (ctx) => {
  ctx.body = await sessionService.getSessions();
  ctx.status = 200;
};

const activateSession = async (ctx) => {
  await sessionService.activateSession(ctx.request.body);
  ctx.status = 204;
};

const deactivateCurrentSession = async (ctx) => {
  await sessionService.deactivateCurrentSession();
  ctx.status = 204;
};

const getCurrentSession = async (ctx) => {
  const currentSession = await sessionService.getCurrentSession();
  ctx.body = currentSession.name;

  const { query } = ctx.request;
  const queryCount = Object.entries(query).length;
  if (queryCount > 0) ctx.body = { name: currentSession.name };

  if ('tracedRequests' in query && query.tracedRequests == 'true') {
    ctx.body.tracedRequests = currentSession._tracedRequests;
  }
  ctx.status = 200;
};

const addSessions = async (ctx) => {
  const { file } = ctx.request.files;
  await sessionService.addSessions(file);
  ctx.status = 201;
};

const downloadSession = async (ctx) => {
  const { sessionName } = ctx.request.params;
  ctx.type = "application/zip";
  ctx.attachment(`${sessionName}.zip`);
  ctx.body = await sessionService.downloadSession(sessionName);
  ctx.status = 200;
};

module.exports = {
  getSessions,
  activateSession,
  deactivateCurrentSession,
  getCurrentSession,
  addSessions,
  downloadSession,
};
