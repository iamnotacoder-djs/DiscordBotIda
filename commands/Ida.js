'use strict';
const 	BaseCommand = require('../structures/BaseCommand'),
		{ MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu } = require('discord.js');

class ITshnik extends BaseCommand {

    name = "ida";
    usage = "Меню бота";
    type = [Config.CommandType.CHAT, Config.CommandType.SLASH_APPLICATION];
	category = [Config.CommandCategory.UNSET];
    bot_permissions = [
        'SEND_MESSAGES'
    ];
    slash = { 
        name: this.name, 
        description: this.usage, 
        type: `CHAT_INPUT`, 
        options: this.options, 
        defaultPermission: true 
    };
    componentsNames = [`itshnik_sm`, `itshnik_sm_slash`, `itshnik_sm_admin_roles`];

    constructor() {
        super();
    }

    async execute(client, command) {
		if (command.inGuild() && command.member.permissions.has('ADMINISTRATOR')) {
			command.channel.send({
				content: `Тут будет инфа о боте или сервере?`,
				reply: {
					messageReference: command
				}
			});
			command.reply({
				content: `Админ-ПУ`,
				components: [
					new MessageActionRow()
						.addComponents([
							new MessageSelectMenu()
								.setCustomId('itshnik_sm')
								.setPlaceholder('Админ-меню')
								.setMinValues(0)
								.setMaxValues(1)
								.addOptions([
									{
										label: `Установщик команд`,
										description: `Включение/выключение Slash-команд на сервере`,
										value: `itshnik_sm_slash`
									}, 
									{
										label: `Админ-роли`,
										description: `Выбор ролей, кому будут доступны админ-команды`,
										value: `itshnik_sm_admin_roles`
									}
								])
						])
				],
				ephemeral: true
			});
		} else {
			command.reply(`Тут будет инфа о боте или сервере?`);
		}
    }
	
    componentListener(client, interaction) {
		if (interaction.isSelectMenu()) {
			if (interaction.customId == "itshnik_sm") {
				if (interaction.values.includes(`itshnik_sm_slash`)) {
					interaction.guild.commands.fetch()
						.then((commands) => {
							let comps = [];
							let options = [];
							client.commands.forEach((cmd) => {
								if (cmd.type.includes(Config.CommandType.SLASH) || cmd.type.includes(Config.CommandType.CTX_USER) || cmd.type.includes(Config.CommandType.CTX_MESSAGE)) {
									if (options.length < 25) {
										options.push({
											label: cmd.name,
											description: cmd.usage,
											value: cmd.name,
											default: commands.filter(c => c.name == cmd.name).size != 0
										});
									} else {
										const selectMenu = new MessageSelectMenu()
											.setCustomId('itshnik_sm_slash')
											.setPlaceholder('Ничего не выбрано')
											.setMinValues(0)
											.setMaxValues(options.length)
											.addOptions(options);
										if (comps.length < 5) comps.push(
											new MessageActionRow()
												.addComponents(selectMenu)
										);
										options = [{
											label: cmd.name,
											description: cmd.usage,
											value: cmd.name,
											default: commands.filter(c => c.name == cmd.name).size != 0
										}];
									}
								}
							});
							if (options.length > 0) {
								const selectMenu = new MessageSelectMenu()
									.setCustomId('itshnik_sm_slash')
									.setPlaceholder('Ничего не выбрано')
									.setMinValues(0)
									.setMaxValues(options.length)
									.addOptions(options);
								if (comps.length < 5) comps.push(
									new MessageActionRow()
										.addComponents(selectMenu)
								);
							}
							interaction.reply({
								content: `Установщик Slash-команд`, 
								components: comps, 
								ephemeral: true
							});
						});	
					return true;
				} else if (interaction.values.includes(`itshnik_sm_admin_roles`)) {
					interaction.guild.roles.fetch()
						.then((roles) => {
							const setted_roles = client.db.get(`guilds.g${interaction.guild.id}.admins`) ?? [];
							roles = roles.sort((b, a) => a.position - b.position || a.id - b.id);
							let options = [];
							roles.forEach((r) => {
								if (options.length < 25 && r.id != interaction.guild.id) {
									options.push({
										label: r.name,
										value: r.id,
										default: setted_roles.includes(r.id)
									});
								}
							});
							interaction.reply({
								components: [
									new MessageActionRow()
										.addComponents([
											new MessageSelectMenu()
												.setCustomId('itshnik_sm_admin_roles')
												.setPlaceholder('Выбери роли для доступа к админ-командам')
												.setMinValues(0)
												.setMaxValues(options.length)
												.addOptions(options)
										])
								],
								ephemeral: true
							});
						});
					return true;
				} 
				return false;
			}
			if (interaction.customId == "itshnik_sm_admin_roles") {
				client.db.set(`guilds.g${interaction.guild.id}.admins`, interaction.values);
				interaction.reply({
					content: `Выбранным ролям выдан доступ к админ-командам: ${interaction.values.length == 0? `Ролей нет`: `<@&${interaction.values.join(`> <@&`)}>`}`,
					ephemeral: true
				});
				return true;
			}
			if (interaction.customId == "itshnik_sm_slash") {
				interaction.guild.commands.fetch()
					.then((currentCommands) => {
						let updatedCommands = [];
						let menuOptions = interaction.component.options;
						if (currentCommands.size == 0) {
							interaction.values.forEach((option) => {
								let ccmd = client.commands.get(option);
								if (ccmd != undefined) updatedCommands.push(ccmd.slash);
							});
						} else {
							menuOptions.forEach((option) => {
								// Если опция была выбрана в селект-менюшке
								if (interaction.values.includes(option.value)) {
									let ccmd = client.commands.get(option.value);
									if (ccmd != undefined) updatedCommands.push(ccmd.slash);
								} else {
									// do nothing
								}
							});
							currentCommands.forEach((command) => {
								if (menuOptions.filter(c => c.label == command.name).size == 0) {
									let ccmd = client.commands.get(command.name);
									if (ccmd != undefined) updatedCommands.push(ccmd.slash);
								}
							});
						}
						interaction.guild.commands.set(updatedCommands);
						interaction.reply({
							content: `Команды установлены`,
							ephemeral: true
						});
					});
				return true;
			}
		}
		return false;
    }
}

module.exports = ITshnik