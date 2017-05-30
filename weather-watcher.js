const config = require('./config.js');
const log = require('log4js').getLogger('weather-service');
const weather = require('weather-js');
const AMQP = require('amqp');


module.exports.getWeather = () => weather.find({
    search: 'Moscow, Russia',
    lang: 'RU',
    degreeType: 'C'
}, (err, result) => {
    log.info("Update weather");
    if (!err) {
        let data = result[0]['forecast'].filter(row => row.date == getTomorrow())[0];
        postState('Завтра ' + data['low'] + 'C, ' + data['skytextday']);
    } else {
        log.error(err.stack)
    }
});

function getTomorrow() {
    let d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}

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