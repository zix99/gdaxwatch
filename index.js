const gdax = require('gdax');
const blessed = require('blessed');
const numeral = require('numeral');
const Promise = require('bluebird');
const _ = require('lodash');
const config = require('./config');

const client = Promise.promisifyAll(new gdax.AuthenticatedClient(config.key, config.b64secret, config.passphrase, config.url), {multiArgs:true});

const screen = blessed.screen({smartCSR: true});
const priceTable = blessed.table({
	parent:screen,
	border: {
	    type: 'line'
	  },
});
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

function update() {
	client.getAccountsAsync().spread((resp, data) => {
		const NUMF = "0,0.0000";
		let rows = _.map(data, val => {
			return [val.currency, numeral(val.balance).format(NUMF), numeral(val.available).format(NUMF), numeral(val.hold).format(NUMF)];
		});
		rows.unshift(['Currency', 'Balance', 'Available', 'Hold']);
		priceTable.setData(rows);
		screen.render();
	});
}

setInterval(update, 30 * 1000);
update();
