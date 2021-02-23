const fs = require("fs");
const unzipper = require('unzipper');
const { sessionsDirectory } = require("../../config/config");
const session = require("../../shared/session");
const { deleteFile, listSubdirectories } = require('../../utils/fs');


const getSessions = async (ctx) => {
  const sessions = await listSubdirectories(sessionsDirectory);

  ctx.status = 200;
  ctx.body = sessions;
};

const activateSession = async (ctx) => {
  const { requiredFiles } = session;
  const { body } = ctx.request;
  
  Object.assign(session, {
    name: body.name,
    fileType: body.fileType || "json",
    repeat: body.repeat || false,
    proxy: body.proxy || false,
    requestCounter: 0,
    requiredFiles: [],
  });

  requiredFiles.forEach((filePath) => delete require.cache[filePath]);

  ctx.status = 204;
};

const deactivateCurrentSession = async (ctx) => {
  Object.assign(session, { name: "" });
  ctx.status = 204;
};

const getCurrentSession = async (ctx) => {
  ctx.status = 200;
  ctx.body = session.name;
};

const addSessions = async (ctx) => {
  const { file } = ctx.request.files;
  await fs.createReadStream(file.path).pipe(unzipper.Extract({ path: sessionsDirectory })).promise();
  await deleteFile(file.path);

  ctx.status = 201;
};

module.exports = {
  getSessions,
  activateSession,
  deactivateCurrentSession,
  getCurrentSession,
  addSessions,
};
