const gdax = require('gdax');
const blessed = require('blessed');
const numeral = require('numeral');
const Promise = require('bluebird');
const moment = require('moment');
const _ = require('lodash');
const config = require('./config');

const client = Promise.promisifyAll(new gdax.AuthenticatedClient(config.key, config.b64secret, config.passphrase, config.url), {multiArgs:true});

const coinClient = {
	'BTC' : Promise.promisifyAll(new gdax.PublicClient('BTC-USD')),
	'ETH' : Promise.promisifyAll(new gdax.PublicClient('ETH-USD')),
	'LTC' : Promise.promisifyAll(new gdax.PublicClient('LTC-USD')),
}

const NUMF = "0,0.0000";

const screen = blessed.screen({smartCSR: true});
const title = blessed.text({
	parent: screen,
	align: 'right',
	width: '100%',
});
const priceTable = blessed.table({
	parent:screen,
	border: {
		type: 'line'
	},
	top: 1,
	style : {
		header: {
			bold: true,
			bg: 'green',
		}
	},
});
blessed.text({
	parent:screen,
	top:13,
	content: 'Outstanding Orders:'
})
const orderTable = blessed.table({
	parent: screen,
	border: {
		type: 'line',
	},
	top: 14,
	style : {
		header: {
			bold: true,
			bg: 'blue',
		}
	},
});
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

function getTicker(currency) {
	if (!_.has(coinClient, currency))
		return Promise.resolve({price: 1});
	return coinClient[currency].getProductTickerAsync()
		.then(resp => JSON.parse(resp.body));
}

function updatePriceTable() {
	return client.getAccountsAsync().spread((resp, accounts) => {
		return Promise.map(accounts, account => {
			return getTicker(account.currency).then(ticker => {
				return [
					account.currency,
					numeral(ticker.price).format(NUMF),
					numeral(account.balance).format(NUMF),
					numeral(account.hold).format(NUMF),
					numeral(account.balance).multiply(ticker.price).format(NUMF),
				];
			});
		}).then(rows => {
			let ordered = _.orderBy(rows, x => x[0]);
			ordered.unshift(['Currency', 'Price', 'Balance', 'Hold', 'USD']);
			priceTable.setData(ordered);
		});
	});
}

function updateOrderTable() {
	return client.getOrdersAsync().spread((resp, orders) => {
		let rows = _.map(orders, order => 
			[order.product_id, order.side, order.type, moment(order.created_at).format('M/D H:mm'), numeral(order.size).format(NUMF), numeral(order.price).format(NUMF)]
		);
		rows.unshift(['Product', 'Side', 'Type', 'Created', 'Size', 'Price']);
		orderTable.setData(rows);
	});
}

function update() {
	return Promise.all([
			updatePriceTable(),
			updateOrderTable(),
		]).then(() => {
			title.setText('Updated: ' + moment().format('L HH:mm'));
			screen.render();
		});
}

setInterval(update, 60 * 1000);
update();
