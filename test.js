const config = require('./config.js');
const NetApi = require('./modules/net-api.js');
const MessageApi = require('./modules/message-api.js');

const messageApi = new MessageApi(config.telegramSvc);
const netApi = new NetApi(config);

netApi.notifyAboutUnknownHosts((message) => messageApi.sendMessage({to: config.to, type: 'text', version: '2', text: message}).catch(console.error));