const fs = require("fs");
const { sessionsDirectory } = require("../../config/config");
const session = require("../../shared/session");
const unzipper = require('unzipper');

const fsPromises = fs.promises;

const listSubdirectories = async (directory) => {
  const directoryItems = await fsPromises.readdir(directory, {
    withFileTypes: true,
  });
  return directoryItems.filter((directoryItem) => directoryItem.isDirectory()).map((directoryItem) => directoryItem.name);
};

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
    sticky: body.sticky || false,
    requests: {},
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
  await fsPromises.unlink(file.path);

  ctx.status = 201;
};

module.exports = {
  getSessions,
  activateSession,
  deactivateCurrentSession,
  getCurrentSession,
  addSessions,
};
