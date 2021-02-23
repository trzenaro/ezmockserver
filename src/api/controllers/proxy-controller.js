const path = require("path");
const { proxy } = require("../../config/config");
const { listSubdirectories, zipDirectory } = require("../../utils/fs");

const getSessions = async (ctx) => {
  const sessions = await listSubdirectories(proxy.recordingDirectory);

  ctx.status = 200;
  ctx.body = sessions;
};

const downloadSession = async (ctx) => {
  const { sessionName } = ctx.request.params;
  const sessionDirectory = path.join(proxy.recordingDirectory, sessionName);

  ctx.status = 200;
  ctx.type = "application/zip";
  ctx.attachment(`${sessionName}.zip`);
  ctx.body = zipDirectory(sessionDirectory);
};

module.exports = {
  getSessions,
  downloadSession,
};
