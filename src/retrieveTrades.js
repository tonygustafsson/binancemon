const fetch = require('node-fetch');

const config = require('../config.json'),
    log = require('./log'),
    tradesUrl =
        config.binanceKey && config.maxTradesToFetchTotal > 500
            ? `https://api.binance.com/api/v1/historicalTrades?symbol=${config.market}`
            : `https://api.binance.com/api/v1/trades?symbol=${config.market}`;

var reqArray = [];

exports.fromBinance = function(db, dbTrades) {
    new Promise((resolve, reject) => {
        try {
            fetch(tradesUrl, {
                headers: {
                    'User-Agent': config.userAgent,
                    'X-MBX-APIKEY': config.binanceKey
                }
            })
                .catch(err => {
                    log.echo(`Could not fetch ${tradesUrl}: ${err}`);
                })
                .then(res => {
                    log.echo(`Fetching ${tradesUrl}.`);
                    return res.json();
                })
                .then(json => {
                    let fromId = json[0].id,
                        firstIdToFetch =
                            config.binanceKey !== false && config.maxTradesToFetchTotal > 500
                                ? fromId - config.maxTradesToFetchTotal
                                : fromId;

                    for (let i = fromId; i >= firstIdToFetch; i = i - config.maxTradesToFetch) {
                        // Back from the first id in the list until we reach the goal

                        reqArray.push(
                            new Promise((resolve, reject) => {
                                fetch(`${tradesUrl}&fromId=${i}`, {
                                    headers: {
                                        'User-Agent':
                                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
                                        'X-MBX-APIKEY': config.binanceKey
                                    }
                                })
                                    .then(res => {
                                        log.echo(`Fetching ${tradesUrl}&fromId=${i}.`);

                                        return res.json();
                                    })
                                    .then(json => {
                                        resolve(json);
                                    })
                                    .catch(err => {
                                        reject(err);
                                    });
                            })
                        );
                    }

                    resolve(json);
                });
        } catch (err) {
            log.echo(err);
            reject(err);
        }
    }).then(json => {
        Promise.all(reqArray).then(values => {
            values.forEach(response => {
                json = json.concat(response);
            });

            json.forEach(trade => {
                var thisDbTrade = dbTrades.find({ id: trade.id });

                if (thisDbTrade.length === 0) {
                    dbTrades.insert(trade);
                }
            });

            db.saveDatabase();
        });
    });
};
