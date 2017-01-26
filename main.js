const config = require('./config.js');

const nmap = require('node-nmap');
const Mongo = require('mongodb');
const AMQP = require('amqp');
const log = require('log4js').getLogger('net-service');

module.exports.getNetworkState = function (topic) {
    log.info("Update network state");
    getHosts((err, message) => {
        err ? log.error(err.stack) : postState(message);
    });

};

function getHosts(callback) {

    log.debug("Network scan is in progress");
    const quickScan = new nmap.nodenmap.QuickScan(config.network.address);

    loadNetworkState((err, networkState) => {

        if (err) {
            callback(err, null);
        }

        networkState.hosts = networkState.hasOwnProperty('hosts') ? networkState.hosts : [];

        quickScan.on('complete', data => {
            let onlineHosts = data.map(host => host.ip).filter(hostIp => !config.network.skippedHosts.includes(hostIp));
            let lastStateHosts = networkState.hosts;

            log.debug("Alive hosts: " + onlineHosts);

            onlineHosts.filter(hostIp => !lastStateHosts.includes(hostIp)).forEach(hostIp => {
                log.debug(hostIp + ' is up');
                callback(null, getMessage(hostIp, '👻'));
            });

            lastStateHosts.filter(hostIp => !onlineHosts.includes(hostIp)).forEach(hostIp => {
                log.debug(hostIp + ' is up');
                callback(null, getMessage(hostIp, '☠'));
            });

            networkState.hosts = onlineHosts;

            saveNetworkState(networkState, (err, res) => err ? callback(err, null) : 0);
        });

        quickScan.on('error', err => err ? callback(err, null) : 0);

        quickScan.startScan();
    });
}

function postState(text) {
    log.info(config.to.username + " <- " + text);
    const message = {to: config.to, text: text};
    const connection = AMQP.createConnection(config.mq.connection);

    connection.on('error', err => log.error("Error from amqp: " + err.stack));

    connection.on('ready', () => {
        connection.exchange(config.mq.exchange, {type: 'fanout', durable: true, autoDelete: false}, exchange =>
            exchange.publish('', JSON.stringify(message), {}, (isSend, err) => err ? log.error(err.stack) : 0)
        );
    });
}

function getMessage(hostIp, sign) {
    return [hostIp, (config.network.knownHosts[hostIp] || '???'), sign].join(' ');
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