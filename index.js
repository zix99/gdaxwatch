const gdax = require('gdax');
const blessed = require('blessed');
const numeral = require('numeral');
const Promise = require('bluebird');
const moment = require('moment');
const chalk = require('chalk');
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
const priceTable = blessed.ListTable({
	parent:screen,
	border: {
		type: 'line'
	},
	top: 1,
	height: 8,
	style : {
		header: {
			bold: true,
			bg: 'green',
		}
	},
});
blessed.text({
	parent:screen,
	top:9,
	content: 'Orders: (O=outstanding, F=filled, X=non-filled)'
})
const orderTable = blessed.ListTable({
	parent: screen,
	border: {
		type: 'line',
	},
	top: 10,
	height:15,
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

function getAccountsData() {
	return client.getAccountsAsync()
		.spread((resp, accounts) => accounts)
		.map(account => {
			return getTicker(account.currency)
				.then(ticker => {
					return {
						currency: account.currency,
						balance: numeral(account.balance),
						available: numeral(account.available),
						hold: numeral(account.hold),
						price: numeral(ticker.price),
						usd: numeral(account.balance).multiply(ticker.price),
					};
				});
		});
}

function updatePriceTable() {
	return getAccountsData()
		.then(accounts => {
			let ordered = _.orderBy(accounts, x => x.currency);
			let sumUsd = _.reduce(accounts, (total, x) => total.add(x.usd.value()), numeral(0));

			let rows = _.map(ordered, row => {
				return [
					row.currency,
					row.price.format(NUMF),
					row.balance.format(NUMF),
					row.hold.format(NUMF),
					row.usd.format(NUMF)
				];
			});
			rows.unshift(['Currency', 'Price', 'Balance', 'Hold', 'USD']);
			rows.push(['Sum','','','',sumUsd.format(NUMF)]);
			priceTable.setData(rows);
		});
}

function updateOrderTable() {
	return Promise.all([
		client.getOrdersAsync().spread((resp, orders) => orders),
		client.getFillsAsync().spread((resp, fills) => fills),
	]).spread((orders, fills) => {
		let rows = _.concat(
			_.map(orders, order => 
				[
					'O',
					order.product_id,
					order.side,
					order.type,
					moment(order.created_at).format('M/D H:mm'),
					numeral(order.size).format(NUMF),
					numeral(order.price).format(NUMF)
				]
			),
			[[]], //empty row
			_.map(_.take(fills, 10), fill => [
				fill.settled ? 'F' : 'X',
				fill.product_id,
				fill.side,
				'',
				moment(fill.created_at).format('M/D H:mm'),
				numeral(fill.size).format(NUMF),
				numeral(fill.price).format(NUMF),
				numeral(fill.fee).format(NUMF),
			])
		);
		rows.unshift(['', 'Product', 'Side', 'Type', 'Created', 'Size', 'Price', 'Fee']);
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
