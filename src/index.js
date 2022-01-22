#!/usr/bin/env node
require("dotenv").config();
const config = require("./config/config");
const api = require("./api/api");
const server = require("./server/server");
const sessionService = require("./api/services/session-service");
const logger = require('./utils/light-logger');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.on("SIGINT", () => process.exit(0));

(async () => {
  try {
    await api.init();
    await server.init();

    if (config.defaultSession) {
      await sessionService.activateSession(config.defaultSession);
    }
  } catch (error) {
    logger.error(error);
    process.exit(0);
  }
})();
