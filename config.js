module.exports = require('rc')('gdax', {
	passphrase: '',
	key: '',
	b64secret: '',
	url: 'https://api.gdax.com',
	ordercount: 10,
	currencies: {
		'BTC' : 'BTC-USD',
		'ETH' : 'ETH-USD',
		'LTC' : 'LTC-USD',
	},
});