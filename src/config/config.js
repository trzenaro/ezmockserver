const path = require('path');
module.exports = {
  sessionsDirectory: process.env.SESSIONS_PATH || path.resolve("../../sessions"),
  server: {
    port: process.env.SERVER_PORT || 3000,
  },
  api: {
    port: process.env.API_PORT || 3050,
  },
};
