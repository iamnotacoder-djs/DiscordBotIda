'use strict';
const BaseCommand = require('../structures/BaseCommand'),
	{ ApplicationCommandType, PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

/**
 * Пример команды смены языка бота
 * "Локализация" доступна только внутри команды
 */
class Lang extends BaseCommand {

	name = "lang";
	usage = Config.Strings.langs.join(', ');
	type = [Config.CommandType.CHAT, Config.CommandType.SLASH_APPLICATION];
	bot_permissions = [
		PermissionFlagsBits.SendMessages
	];
	options = [];
	slash = {
		name: this.name,
		description: this.usage,
		type: ApplicationCommandType.ChatInput,
		options: this.options,
		nameLocalizations: {
			"ru": Config.Strings.cmd_lang_name[0],
			"uk": Config.Strings.cmd_lang_name[1],
			"en-US": Config.Strings.cmd_lang_name[2],
			"en-GB": Config.Strings.cmd_lang_name[2]
		}
	};
	componentsNames = [];

	constructor() {
		super();
		let option = {
			name: "lang",
			type: ApplicationCommandOptionType.String,
			description: `Bot's Language`,
			required: true,
			choices: [],
			nameLocalizations: {
				"ru": Config.Strings.cmd_lang_name[0],
				"uk": Config.Strings.cmd_lang_name[1],
				"en-US": Config.Strings.cmd_lang_name[2],
				"en-GB": Config.Strings.cmd_lang_name[2]
			},
			descriptionLocalizations: {
				"ru": Config.Strings.cmd_lang_opt_description[0],
				"uk": Config.Strings.cmd_lang_opt_description[1],
				"en-US": Config.Strings.cmd_lang_opt_description[2],
				"en-GB": Config.Strings.cmd_lang_opt_description[2]
			}
		};
		for (let i = 0; i < Config.Strings.langs.length; i++) {
			option.choices.push({
				name: Config.Strings.langs[i],
				value: `${i}`
			});
		}
		this.options.push(option);
	}

	async execute(client, command) {
		let user = await client.user.fetch();

		// Валидация ответа
		let lang = 0;
		if (command.content != undefined) {
			const args = command.content.replace(`<@${client.user.id}>`, '').slice(Config.prefix.length).trim().split(/ +/g);
			const command = args.shift();
			if (args.length != 0) lang = parseInt(args[0]);
		} else {
			lang = parseInt(command.options.getString('lang'));
		}
		if (lang < 0) lang = 0;
		if (lang >= Config.Strings.langs.length) lang = Config.Strings.langs.length - 1;

		// Цель пользователь / сервер
		let targetId = command.user.id;
		if (command.inGuild()) {
			if (command.member.permissions.has(PermissionFlagsBits.Administrator)) {
				targetId = command.guild.id;
			} else {
				// У пользователя нет прав на изменение настроек сервера, но язык обновим для его ЛС
				client.db.set(command.user.id, lang);
				return command.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(client.user.username)
							.setDescription(Config.Strings[`cmd_lang_guild_error`][lang])
							.setColor(user.accentColor)
					],
					ephemeral: true
				});
			}
		}
		client.db.set(targetId, lang);

		// Ответ
		return command.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(client.user.username)
					.setDescription(Config.Strings[`cmd_lang_${command.inGuild() ? 'guild' : 'user'}_success`][lang])
					.setColor(user.accentColor)
			],
			ephemeral: true
		});
	}
}

module.exports = Lang