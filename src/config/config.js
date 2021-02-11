const path = require("path");
const fs = require("fs");

const settingsPath = path.resolve(process.env.CONFIG_PATH || "mockserver.json");
const settingsFile = fs.readFileSync(settingsPath);
const settings = JSON.parse(settingsFile);

module.exports = {
  sessionsDirectory: path.resolve(settings.sessionsDirectory),
  server: {
    port: settings.server.port,
  },
  api: {
    port: settings.api.port,
  },
};
