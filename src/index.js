#!/usr/bin/env node
require('dotenv').config();
const api = require("./api/api");
const server = require("./server/server");

process.on('SIGINT', () => process.exit(0))

api.init();
server.init();
