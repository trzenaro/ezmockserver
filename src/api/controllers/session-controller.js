const fs = require("fs");
const path = require("path");
const unzipper = require('unzipper');
const { sessionsDirectory } = require("../../config/config");
const session = require("../../shared/session");
const { deleteFile, listSubdirectories, zipDirectory } = require('../../utils/fs');


const getSessions = async (ctx) => {
  const sessions = await listSubdirectories(sessionsDirectory);

  ctx.status = 200;
  ctx.body = sessions;
};

const activateSession = async (ctx) => {
  const { _requiredFiles } = session;
  const { body } = ctx.request;
  
  Object.assign(session, {
    name: body.name,
    fileType: body.fileType || "content",
    logRequest: ('logRequest' in body ) ? body.logRequest : true,
    repeat: ('repeat' in body ) ? body.repeat : false,
    groupResponsesByIp: ('groupResponsesByIp' in body ) ? body.groupResponsesByIp : false,
    _requestCounter: { "0.0.0.0": 0 },
    _requiredFiles: [],
  });

  _requiredFiles.forEach((filePath) => delete require.cache[filePath]);

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

const downloadSession = async (ctx) => {
  const { sessionName } = ctx.request.params;
  const sessionDirectory = path.join(sessionsDirectory, sessionName);

  ctx.status = 200;
  ctx.type = "application/zip";
  ctx.attachment(`${sessionName}.zip`);
  ctx.body = zipDirectory(sessionDirectory);
};

module.exports = {
  getSessions,
  activateSession,
  deactivateCurrentSession,
  getCurrentSession,
  addSessions,
  downloadSession
};
