const fetch = require('node-fetch');

const config = require('./config.json');
const tradesUrl = `https://api.binance.com/api/v1/historicalTrades?symbol=${config.market}`;

const log = msg => {
    console.log(msg);
    fs.appendFileSync('output.txt', `${msg}\r\n`);
};

exports.fromBinance = function(db, dbTrades) {
    new Promise((resolve, reject) => {
        try {
            fetch(tradesUrl, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
                    'X-MBX-APIKEY': config.binanceKey
                }
            })
                .then(res => {
                    console.log(`Fetching ${tradesUrl}.`);
                    return res.json();
                })
                .then(json => {
                    let fromId = json[0].id,
                        firstIdToFetch = fromId - config.maxTradesToFetchTotal;

                    for (let i = fromId; i > firstIdToFetch; i = i - config.maxTradesToFetch) {
                        // Back from the first id in the list until we reach the gaol
                        global.reqArray.push(
                            new Promise((resolve, reject) => {
                                fetch(`${tradesUrl}&fromId=${i}`, {
                                    headers: {
                                        'User-Agent':
                                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
                                        'X-MBX-APIKEY': config.binanceKey
                                    }
                                })
                                    .then(res => {
                                        console.log(`Fetching ${tradesUrl}&fromId=${i}.`);

                                        return res.json();
                                    })
                                    .then(json => {
                                        // log(json);
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
            log(err);
            reject(err);
        }
    }).then(json => {
        let prices = [];

        Promise.all(global.reqArray).then(values => {
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
