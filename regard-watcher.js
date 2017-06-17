const config = require('./config.js');
const request = require('request');
const AMQP = require('amqp');
const log = require('log4js').getLogger('regard-service');

const filter = [
    'Radeon RX 570',
    'Radeon RX 580',
    'Radeon RX 470',
    'Radeon RX 580',
    'GeForce GTX 1050',
    'GeForce GTX 1050 Ti',
    'GeForce GTX 1060'
];

module.exports.getActualGPU = () => {
    const options = {
        url: 'http://www.regard.ru/ajax/filter2.0.php?id=4000',
        headers: {
            'User-Agent': 'request',
            'Server': 'regard',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block'
        }
    };
    request(options, (err, response, body) => {
        let cat = JSON.parse(body);

        let available ={};

        Object.keys(cat.propy[4].v).map(row => cat.propy[4].v[row])
            .filter(row => filter.includes(row['1']) && row['2'] != null)
            .forEach(row => available[row['1']] = row['2']);

        postState(filter.reduce((last, next) => last + '\n' + next + ' ' + (available[next] || 0), '') + '\n http://www.regard.ru/catalog/group4000.htm');
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