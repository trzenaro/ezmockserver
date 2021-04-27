#!/usr/bin/env node
require("dotenv").config();
const api = require("./api/api");
const server = require("./server/server");
const config = require("./config/config");
const sessionService = require("./api/services/session-service");

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
    console.error(error);
    process.exit(0);
  }
})();
