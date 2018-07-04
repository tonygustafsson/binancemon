const moment = require('moment');
const ma = require('moving-averages');

const config = require('../config.json'),
    log = require('./log');

exports.trades = function(trades) {
    var prices = [];

    trades.forEach(trade => {
        var float = parseFloat(trade.price);
        if (isNaN(float)) float = 0;

        prices.push(float);
    });

    const emaResults = ma.ema(prices, config.emaHistoryLimit);

    trades.forEach((trade, i) => {
        let price = prices[i].toFixed(config.decimals),
            ema = emaResults[i].toFixed(config.decimals),
            diff = price > ema ? (price - ema).toFixed(config.decimals) : (ema - price).toFixed(config.decimals),
            margin = ((diff / price) * 100).toFixed(config.decimals),
            noticeEmaDiff = margin >= config.emaMargin;

        if (price > ema && noticeEmaDiff) {
            // Buy
            log.echo(`${moment(trade.time).format()};Buy;${price};${ema};${diff};${margin}%.`);
        } else if (noticeEmaDiff) {
            // Sell
            log.echo(`${moment(trade.time).format()};Sell;${price};${ema};${diff};${margin}%.`);
        }
    });
};
