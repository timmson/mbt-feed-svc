const log = require('log4js').getLogger('net');
const request = require('request-promise');
const Mongo = require('mongodb');

function NetworkApi(config) {
    this.hostSVCurl = 'http://' + config.hostSvc.host + ':' + config.hostSvc.port + '/system/net';
    this.mongoUrl = config.mongo.url
}

NetworkApi.prototype.notifyAboutUnknownHosts = function (notify) {
    this.connect().then(
        db => this.loadNetworkState(db).then(
            networkState => {
                networkState.hosts = networkState.hasOwnProperty('hosts') ? networkState.hosts : [];
                this.scanNetwork().then(
                    onlineHosts => {
                        let lastStateHosts = networkState.hosts;

                        log.debug("Alive hosts: " + JSON.stringify(onlineHosts));

                        onlineHosts.filter(host => !lastStateHosts.includes(host.ip) && host.description === '?').forEach(host => {
                            log.info(host.ip + ' is up');
                            notify(host.ip + ' ' + host.mac + ' 👻');
                        });

                        lastStateHosts.filter(hostIp => !onlineHosts.map(host => host.ip).includes(hostIp)).forEach(hostIp => {
                            log.info(hostIp + ' is down');
                            notify(hostIp + ' ☠');
                        });

                        networkState.hosts = onlineHosts.filter(host => host.description === '?').map(host => host.ip);

                        this.saveNetworkState(db, networkState).then(res => db.close(), log.error);
                    },
                    log.error
                );
            },
            err => {
                db.close();
                log.error(err);
            }
        ),
        log.error
    );
};

NetworkApi.prototype.saveNetworkState = function (db, networkState) {
    return new Promise((resolve, reject) => db.collection('network-state').updateOne({}, networkState, {upsert: true}, (err, res) => err ? reject(err) : resolve(res)));
};

NetworkApi.prototype.loadNetworkState = function (db) {
    return new Promise((resolve, reject) => db.collection('network-state').findOne({}, (err, res) => err ? reject(err) : resolve(res)));
};

NetworkApi.prototype.connect = function () {
    return new Promise((resolve, reject) => Mongo.connect(this.mongoUrl, (err, db) => err ? reject(err) : resolve(db)));
};

NetworkApi.prototype.scanNetwork = function () {
    return new Promise((resolve, reject) => request(this.hostSVCurl).then(body => resolve(JSON.parse(body))).catch(err => reject(err)));
};

module.exports = NetworkApi;
