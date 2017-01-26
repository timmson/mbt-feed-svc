const config = require('./config.js');
const main = require('./net-watcher.js');

const log = require('log4js').getLogger('net-service');

log.info("Test started");

main.getNetworkState();