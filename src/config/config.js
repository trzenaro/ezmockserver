const path = require("path");
const fs = require("fs");

const settingsPath = path.resolve(process.env.CONFIG_PATH || "ezmockserver.json");
const settingsFile = fs.readFileSync(settingsPath);
const settings = JSON.parse(settingsFile);

let sessionsDirectory = settings.sessionsDirectory;
if (!path.isAbsolute(settings.sessionsDirectory)) {
  sessionsDirectory = path.join(path.dirname(settingsPath), settings.sessionsDirectory);
}

const config = {
  logLevel: settings.logLevel || "INFO",
  sessionsDirectory,
  server: {
    httpPort: settings.server.httpPort,
    httpsPort: settings.server.httpsPort,
  },
  api: {
    httpPort: settings.api.httpPort,
    httpsPort: settings.api.httpsPort,
  },
  proxy: {
    ...settings.proxy,
  },
  defaultSession: settings.defaultSession || null,
  defaultMatchers: settings.defaultMatchers || [],
};

module.exports = config;
