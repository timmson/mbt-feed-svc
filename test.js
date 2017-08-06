const config = require('./config.js');
const NetApi = require('./modules/net-api.js');

const netApi = new NetApi(config);

netApi.getUnknownHosts().then(console.log);