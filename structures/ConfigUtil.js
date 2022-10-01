'use strict';

class ConfigUtil {

	config = {};
	CommandType = { UNSET: 'unset', CHAT: 'chat', SLASH: 'slash', SLASH_APPLICATION: 'slash_application', CTX_USER: 'context_user', CTX_MESSAGE: 'context_message' };

	constructor() {
		this.config = require("../config.json");
		this.config.CommandType = this.CommandType;
		this.config.Locales = this.Locales;
		return this.config;
	}
}

module.exports = ConfigUtil;
