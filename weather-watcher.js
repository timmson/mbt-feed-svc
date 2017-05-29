const config = require('./config.js');
const log = require('log4js').getLogger('weaher-service');
const weather = require('weather-js');
const AMQP = require('amqp');


module.exports.getWeather = function () {
    log.info("Update weather");
    weather.find({search: 'Moscow, RU', degreeType: 'C'}, function (err, result) {
        if (!err) {
            postState(JSON.stringify(result['current']));
        } else {
            log.error(err.stack)
        }
    })
};

function postState(text) {
    log.info(config.to.username + " <- " + text);
    const message = {to: config.to, text: text};
    const connection = AMQP.createConnection(config.mq.connection);

    connection.on('error', err => log.error("Error from amqp: " + err.stack));

    connection.on('ready', () =>
        connection.exchange(config.mq.exchange, {type: 'fanout', durable: true, autoDelete: false}, exchange =>
            exchange.publish('', JSON.stringify(message), {}, (isSend, err) => {
                err ? log.error(err.stack) : 0;
                connection.disconnect();
            })
        )
    );
}