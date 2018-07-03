# BinanceMon

Monitoring Binance through API. The goal is to use algoritms like Exponentional Moving Average (EMA)
to place new orders accordingly. For now it just calculates when it should by and sell.
And this does not work :)

## How to use

Logon to Binance and get your API key. It is needed for this to work.
Add your API key to config.json and set the market and such.

```
npm install
node binancemon retrieve
node binancemon calculate
```

It should now output when it thinks you should buy and sell. Change the emaHistoryLimit, emaMargin and maxTradesToFetchTotal
to narrow it down to not get to many results.

## How it works

It downloads the last 500 trades from binance for the market you have chosen. When this is done it knows the first id of
these 500. It then uses maxTradesToFetchTotal to figure out how many requests that is needed to get all your data. Be aware of limitations
so you don't get blocked.

It stores all trades on LokiJS in binance.json. It then opens this database when it's time to calculate your trades and find
good buying oportunities. K?

## Configuration

Change settings in config.json.

    * binanceKey: false to only be able to get the latest 500 trades, or your API-key from Binance.
    * logToFile: false to disable logging to file. Or a file path.
    * useDatabase: The database file that should be used.
    * market: The market to retrieve data from, ie ETHBTC
    * userAgent: The useragent that will be presented to Binances API
    * decimals: Number of decimals to consider and show
    * maxTradesToFetch: Leave this to 500. API default.
    * maxTradesToFetchTotal: For more than 500 the binanceKey is needed. If for example this is 5000 - it will do 10 request with 500 trades each.
    * emaMargin: The margin in percentage from the current price to the exponensional moving avarage. Larger means that the current trade must be further from the EMA.
    * emaHistoryLimit: The number of trades to take in consideration when estimating the EMA.

## More info

https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md
