//const config = require('./config.js');
const main = require('./net-watcher');

const log = require('log4js').getLogger('net-service');

main.getNetworkState();