#!/usr/bin/env node
require("dotenv").config();
const api = require("./api/api");
const server = require("./server/server");

process.on("SIGINT", () => process.exit(0));

(async () => {
  try {
    await api.init();
    await server.init();
  } catch (error) {
    process.exit(0);
  }
})();
