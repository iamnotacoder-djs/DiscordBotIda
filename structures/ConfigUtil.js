'use strict';

class ConfigUtil {

	config = {};
	CommandType = { UNSET: 'unset', CHAT: 'chat', SLASH: 'slash', SLASH_APPLICATION: 'slash_application', CTX_USER: 'context_user', CTX_MESSAGE: 'context_message' };

	Locales = {
		"ru": 0,
		"uk": 1,
		"en-US": 2,
		"en-GB": 2,

		"bg": 2, "zh-CN": 2, "zh-TW": 2, "hr": 2, "cs": 2, "da": 2, "nl": 2, "fi": 2, "fr": 2, "de": 2, "el": 2, "hi": 2, "hu": 2, "it": 2, "ja": 2, "ko": 2, "lt": 2, "no": 2, "pl": 2, "pt-BR": 2, "ro": 2, "es-ES": 2, "sv-SE": 2, "th": 2, "tr": 2, "vi": 2
	};

	constructor() {
		this.config = require("../config.json");
		this.config.Strings = require("../strings.json");
		this.config.CommandType = this.CommandType;
		this.config.Locales = this.Locales;
		return this.config;
	}
}

module.exports = ConfigUtil;
