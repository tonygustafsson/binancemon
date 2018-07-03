'use strict';

const fs = require('fs');
const loki = require('lokijs');

var method = process.argv[2];
var calcTrades = require('./calcTrades');
var retrieveTrades = require('./retrieveTrades');

fs.writeFileSync('output.txt', '');

global.reqArray = [];

// Open LokiJS database and collection trades
var db = new loki('./binance.json');
var dbTrades = null;
db.loadDatabase({}, () => {
    dbTrades = db.getCollection('trades');

    if (dbTrades === null) {
        dbTrades = db.addCollection('trades');
    }

    if (method == 'retrieve') {
        retrieveTrades.fromBinance(db, dbTrades);
    } else if (method === 'calculate') {
        let trades = dbTrades
            .chain()
            .simplesort('id')
            .data();

        calcTrades.fromDatabase(trades);
    } else {
        console.log('Unknown command: ' + method);
    }
});
