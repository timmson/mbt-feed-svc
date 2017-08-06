const config = require('./config.js');
const WeatherApi = require('./modules/weather-api.js');
const MessageApi = require('./modules/message-api.js');

const messageApi = new MessageApi(config.telegramSvc);

WeatherApi.notifyAboutWeather((text) => messageApi.sendMessage({to: config.to, type: 'text', version: '2', text: text}).catch(console.error));