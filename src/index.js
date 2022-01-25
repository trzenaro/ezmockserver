#!/usr/bin/env node
const args = process.argv.slice(2);

if (args[0] === 'init') {
  (async () => {
    const { configureApi } = require('./configureApi')
    await configureApi();
  })();
} else {
  (async () => {
    const { initApi } = require('./initializeApi')
    await initApi()
  })();
}
