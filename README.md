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

## More info

https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md
