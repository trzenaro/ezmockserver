const { promises: fsPromises } = require("fs");
const path = require("path");
const unzipper = require("unzipper");
const { sessionsDirectory } = require("../../config/config");
const { deleteFile, listSubdirectories, zipDirectory } = require("../../utils/fs");
const session = require("../../shared/session");
const config = require("../../config/config");
const logger = require('../../utils/light-logger');

const readSessionFromConfigFile = async (sessionName) => {
  const sessionDirectory = path.join(config.sessionsDirectory, sessionName);
  try {
    const configFileBuffer = await fsPromises.readFile(path.join(sessionDirectory, ".config.json"));
    const sessionConfig = JSON.parse(configFileBuffer);
    delete sessionConfig.name;
    return sessionConfig;
  } catch (error) {
    return null;
  }
};

const activateSession = async (newSession) => {
  const { _requiredFiles } = session;

  const sessionConfigFromFile = await readSessionFromConfigFile(newSession.name);
  if (sessionConfigFromFile) {
    Object.entries(sessionConfigFromFile).forEach(([key, value]) => {
      if (!(key in newSession)) newSession[key] = value;
    });
  }

  Object.assign(session, {
    name: newSession.name,
    fileType: newSession.fileType || "content",
    logRequest: "logRequest" in newSession ? newSession.logRequest : true,
    countMode: "countMode" in newSession ? newSession.countMode : "COUNT_ALL",
    groupResponsesByIp: "groupResponsesByIp" in newSession ? newSession.groupResponsesByIp : true,
    matchers: "matchers" in newSession ? newSession.matchers : config.defaultMatchers,
    _requestCounter: { "0.0.0.0": { total: 0, requests: {} } },
    _requiredFiles: [],
  });

  _requiredFiles.forEach((filePath) => delete require.cache[filePath]);

  logger.info("New session activated");
  logger.info(session);
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
