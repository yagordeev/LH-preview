const DOMAIN = window.location.hostname;
const MODE = (DOMAIN === 'app.leadhunt.one') ? 'production' : (DOMAIN === 'api.leadhunt.one' ? 'development' : 'local');
const CONFIG = {
	local: {
		domain: 'http://localhost:3000',
		// domain: 'http://10.0.1.8:3000',
		server: 'https://chat.leadhunt.one:X0XX',
		api: 'https://chat.leadhunt.one:X0XX/api/1.0'
	},
	development: {
		domain: 'https://api.leadhunt.one',
		server: 'https://chat.leadhunt.one:X0XX',
		api: 'https://chat.leadhunt.one:X0XX/api/1.0'
	},
	production: {
		domain: 'https://app.leadhunt.one',
		server: 'https://chat.leadhunt.one:X7XX',
		api: 'https://chat.leadhunt.one:X7XX/api/1.0'
	}
}
export { CONFIG, MODE };