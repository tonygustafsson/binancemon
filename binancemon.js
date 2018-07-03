'use strict';

const fs = require('fs');
const loki = require('lokijs');

const calc = require('./src/calc');
const retrieveTrades = require('./src/retrieveTrades');
const config = require('./config.json');

var method = process.argv[2];

fs.writeFileSync('output.txt', '');

// Open LokiJS database and collection trades
var db = new loki(config.useDatabase);
var dbTrades = null;

db.loadDatabase({}, () => {
    dbTrades = db.getCollection('trades');

    if (dbTrades === null) {
        dbTrades = db.addCollection('trades');
    }

    switch (method) {
        case 'retrieve':
            retrieveTrades.fromBinance(db, dbTrades);
            break;
        case 'calculate':
            let trades = dbTrades
                .chain()
                .simplesort('id')
                .data();

            calc.trades(trades);
            break;
        default:
            console.log('Unknown command: ' + method);
    }
});
