const log = require('log4js').getLogger('weather');
const weather = require('weather-js');

const weatherIcons = {
    'sunny': '☀',
    'mostly sunny': '🌤',
    'partly sunny': '⛅️',
    'cloudy': '🌥',
    'mostly cloudy': '☁️',
    'light rain': '🌦',
    'rain': '🌧',
    'rain showers': '⛈',
    't-storms': '🌪',
    'light snow' : '🌨'
};


module.exports.notifyAboutWeather = function (notify) {
    weather.find({
        search: 'Moscow, Russia',
        degreeType: 'C'
    }, (err, result) => {
        if (err) {
            log.error(err);
        }
        let data = result[0]['forecast'].filter(row => row.date === getTomorrow())[0];
        notify('Завтра от ' + data['low'] + ' до ' + data['high'] + '℃ ' + (weatherIcons[data['skytextday'].toLowerCase()] || data['skytextday']));
    });
};

function getTomorrow() {
    let d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}