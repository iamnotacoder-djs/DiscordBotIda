'use strict';
const BaseCommand = require('../structures/BaseCommand'),
	{ ApplicationCommandType, PermissionFlagsBits } = require('discord.js');

class Ping extends BaseCommand {

	name = "ping";
	usage = "Replies with Pong!";
	type = [ Config.CommandType.CHAT, Config.CommandType.SLASH_APPLICATION ];
	bot_permissions = [
		PermissionFlagsBits.SendMessages
	];
	slash = {
		name: this.name,
		description: this.usage,
		type: ApplicationCommandType.ChatInput,
		options: this.options,
		nameLocalizations: {
			"ru": "пинг",
			"uk": "пінг",
			"en-US": "ping",
			"en-GB": "ping"
		},
		descriptionLocalizations: {
			"ru": "Отвечает - Понг!",
			"uk": "Відповідає - Понг!",
			"en-US": "Replies with Pong!",
			"en-GB": "Replies with Pong!"
		}
	};
	componentsNames = [];

	constructor() {
		super();
	}

	async execute(client, command) {
		let reply = "🏓 Pong";
		let message = await command.reply({
			content: reply,
			fetchReply: true
		});
		if (command.inGuild()) {
			switch(command.guild.preferredLocale) {
				case "ru": reply = "🏓 Понг";
				case "uk": reply = "🏓 Понг";
				default: reply = "🏓 Pong";
			}
		}
		message.edit({
			content: `${reply}: ${(Date.now() - command.createdTimestamp)}`,
			fetchReply: true
		})
	}
}

module.exports = Ping