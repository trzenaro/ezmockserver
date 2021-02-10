require('dotenv').config();
const api = require("./api/api");
const server = require("./server/server");

api.init();
server.init();
