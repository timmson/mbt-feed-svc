const config = require('./config.js');
const log = require('log4js').getLogger('net-service');
const request = require('request-promise');
const Mongo = require('mongodb');


module.exports.getNetworkState = function () {
    log.info("Update network state");
    getHosts((err, message) => {
        err ? log.error(err.stack) : postState(message);
    });

};

function getHosts(callback) {

    loadNetworkState((err, networkState) => {

        if (err) {
            callback(err, null);
        }

        networkState.hosts = networkState.hasOwnProperty('hosts') ? networkState.hosts : [];

        scanNetwork((err, onlineHosts) => {
            if (err) {
                callback(err, null)
            } else {
                let lastStateHosts = networkState.hosts;

                log.debug("Alive hosts: " + onlineHosts);

                onlineHosts.filter(host => !lastStateHosts.includes(host.ip) && host.description === '?').forEach(host => {
                    log.debug(host.ip + ' is up');
                    callback(null, host.ip + ' ' + host.mac + ' 👻');
                });

                lastStateHosts.filter(hostIp => !onlineHosts.map(host => host.ip).includes(hostIp)).forEach(hostIp => {
                    log.debug(hostIp + ' is down');
                    callback(null, hostIp + ' ☠');
                });

                networkState.hosts = onlineHosts.filter(host => host.description === '?').map(host => host.ip);

                saveNetworkState(networkState, (err, res) => err ? callback(err, null) : 0);
            }
        });

    });
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

function saveNetworkState(networkState, callback) {
    call((db, callback) => db.collection('network-state').updateOne({}, networkState, {upsert: true}, callback), callback);
}

function loadNetworkState(callback) {
    call((db, callback) => db.collection('network-state').findOne({}, (err, networkState) => callback(err, !err && !networkState ? {} : networkState)), callback);
}

function call(action, callback) {
    callback = (callback ? callback : (err, result) => err ? log.error(err.stack) : 0);
    Mongo.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.database, (err, db) => {
        err ? callback(err, null) : action(db, callback);
        db.close();
    });

}

function scanNetwork(callback) {
    const hostSvc = config.hostSvc;
    const url = 'http://' + hostSvc.host + ':' + hostSvc.port + '/net.json';
    request(url, (err, response, body) => callback(err, err ? null : JSON.parse(body)));
}
