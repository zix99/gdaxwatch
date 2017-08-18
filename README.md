# gdaxwatch

Small cli-ui app to print out current balances, orders, and prices
from gdax.

```
Updated: 08/17/2017 23:01
┌──────────┬────────────┬─────────┬────────┬────────────┐
│ Currency │   Price    │ Balance │  Hold  │    USD     │
│   BTC    │ 4,275.0200 │   NaN   │ 0.0000 │   0.0000   │
│   ETH    │  300.9700  │ 2.6436  │ 0.0000 │  795.6362  │
│   LTC    │  45.0100   │ 0.0000  │ 0.0000 │   0.0000   │
│   USD    │   1.0000   │ 27.8206 │ 0.0000 │  27.8206   │
│   Sum    │            │         │        │  823.4569  │
└──────────┴────────────┴─────────┴────────┴────────────┘
Orders: (O=outstanding, F=filled, X=non-filled)
┌───┬─────────┬──────┬──────┬────────────┬────────┬──────────┬────────┐
│   │ Product │ Side │ Type │  Created   │  Size  │  Price   │  Fee   │
│   │         │      │      │            │        │          │        │
│ F │ ETH-USD │ buy  │      │ 8/17 22:32 │ 2.1964 │ 299.4900 │ 0.0000 │
│ F │ ETH-USD │ sell │      │ 8/17 19:10 │ 2.1392 │ 302.2000 │ 0.0000 │
│ F │ ETH-USD │ buy  │      │ 8/17 15:45 │ 2.1392 │ 300.6600 │ 0.0000 │
│   │         │      │      │            │        │          │        │
└───┴─────────┴──────┴──────┴────────────┴────────┴──────────┴────────┘
```

## Installing

Make sure to use at least node 6.x

```bash
npm install -g gdaxwatch
```

## Configuration

gdaxwatch uses the [rc](https://www.npmjs.com/package/rc) library for configuration.

You need to create a new token in **gdax** with at least view permissions.

### Command Line

```bash
node index.js --passphrase <passphrase> --key <key> --b64secret <b64secret>
```

### Config File

Create a file `.gdaxrc` and add your secrets to it, eg:
```
passphrase=xxx
key=yyy
b64secret=zzz
```

And then run `gdaxwatch`

## Running from Code
```sh
npm install
npm start
```