const path = require("path");
const fs = require("fs");

const settingsPath = path.resolve(process.env.CONFIG_PATH || "mockserver.json");
const settingsFile = fs.readFileSync(settingsPath);
const settings = JSON.parse(settingsFile);

const config = {
  sessionsDirectory: path.resolve(settings.sessionsDirectory),
  server: {
    port: settings.server.port,
  },
  api: {
    port: settings.api.port,
  },
};

const { proxy } = settings;
if (proxy) {
  config.proxy = {
    ...proxy,
    recordingDirectory: path.resolve(proxy.recordingDirectory),
  };
}

module.exports = config;
