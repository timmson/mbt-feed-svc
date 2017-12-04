const log = require('log4js').getLogger('message');
const request = require('request-promise');

function MessageApi(msgSvc) {
    this.url = 'http://' + msgSvc.host + ':' + msgSvc.port
}

MessageApi.prototype.sendMessage = function (message) {
    let body = JSON.stringify(message);
    log.debug(body);
    return request.post({
        url: this.url + '/send',
        body: body,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    });
};

module.exports = MessageApi;