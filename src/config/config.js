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
  sessionsDirectory,
  server: {
    port: settings.server.port,
  },
  api: {
    port: settings.api.port,
  },
  proxy: {
    ...settings.proxy,
  },
  defaultSession: settings.defaultSession || null,
};

module.exports = config;
