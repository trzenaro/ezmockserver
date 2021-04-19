const path = require("path");
const unzipper = require("unzipper");
const { sessionsDirectory } = require("../../config/config");
const { deleteFile, listSubdirectories, zipDirectory } = require("../../utils/fs");
const session = require("../../shared/session");

// NO_COUNT
// COUNT_BY_REQUEST_URL
// COUNT_ALL
const activateSession = async (newSession) => {
  const { _requiredFiles } = session;

  Object.assign(session, {
    name: newSession.name,
    fileType: newSession.fileType || "content",
    logRequest: "logRequest" in newSession ? newSession.logRequest : true,
    countMode: "countMode" in newSession ? newSession.countMode : "COUNT_ALL",
    groupResponsesByIp: "groupResponsesByIp" in newSession ? newSession.groupResponsesByIp : false,
    _requestCounter: { "0.0.0.0": { total: 0, requests: {} } },
    _requiredFiles: [],
  });

  _requiredFiles.forEach((filePath) => delete require.cache[filePath]);
};

const deactivateCurrentSession = async () => {
  Object.assign(session, { name: "" });
};

const getCurrentSession = async () => session.name;

const getSessions = async () => listSubdirectories(sessionsDirectory);

const addSessions = async (file) => {
  await fs
    .createReadStream(file.path)
    .pipe(unzipper.Extract({ path: sessionsDirectory }))
    .promise();
  await deleteFile(file.path);
};

const downloadSession = async (sessionName) => {
  const sessionDirectory = path.join(sessionsDirectory, sessionName);
  return zipDirectory(sessionDirectory);
};

module.exports = {
  activateSession,
  deactivateCurrentSession,
  getCurrentSession,
  getSessions,
  addSessions,
  downloadSession,
};
