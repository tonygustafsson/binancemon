const moment = require('moment');
const ma = require('moving-averages');
const fs = require('fs');

var config = require('./config.json');

const log = msg => {
    console.log(msg);
    fs.appendFileSync('output.txt', `${msg}\r\n`);
};

exports.fromDatabase = function(trades) {
    var prices = [];

    trades.forEach(trade => {
        var float = parseFloat(trade.price);
        if (isNaN(float)) return;

        prices.push(parseFloat(trade.price));
    });

    const emaResults = ma.ema(prices, config.emaHistoryLimit);

    for (var i = 0; i < emaResults.length; i++) {
        let price = prices[i].toFixed(config.decimals),
            ema = emaResults[i].toFixed(config.decimals),
            diff = price > ema ? (price - ema).toFixed(config.decimals) : (ema - price).toFixed(config.decimals),
            margin = ((diff / price) * 100).toFixed(config.decimals),
            noticeEmaDiff = margin >= config.emaMargin;

        //log(`${moment(trades[i].time).format()},${price},${ema},${diff},${margin}%`);

        if (price > ema && noticeEmaDiff) {
            // Buy
            log(
                `${moment(trades[i].time)
                    .utc()
                    .format()};Buy;${price};${ema};${diff};${margin}%.`
            );
        } else if (noticeEmaDiff) {
            // Sell
            log(
                `${moment(trades[i].time)
                    .utc()
                    .format()};Sell;${price};${ema};${diff};${margin}%.`
            );
        }
    }
};
