'use strict';
const 	BaseCommand = require('../structures/BaseCommand'),
		{ MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu } = require('discord.js');

class ITshnik extends BaseCommand {

    name = "ida";
    usage = "Меню бота";
    type = [this.CommandType.CHAT, this.CommandType.SLASH_APPLICATION];
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
    componentsNames = [`itshnik_si`, `itshnik_si_chooser`];

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
						.addComponents(
							new MessageButton()
								.setLabel("Установщик команд")
								.setStyle("PRIMARY")
								.setCustomId("itshnik_si")
						)
				],
				ephemeral: true
			});
		} else {
			command.reply(`Тут будет инфа о боте или сервере?`);
		}
    }
	
    componentListener(client, interaction) {
		if (interaction.isButton()) {
			if (interaction.customId == "itshnik_si") {
				interaction.guild.commands.fetch()
					.then((commands) => {
						let comps = [];
						let options = [];
						client.commands.forEach((cmd) => {
							if (cmd.type.includes(cmd.CommandType.SLASH) || cmd.type.includes(cmd.CommandType.CTX_USER) || cmd.type.includes(cmd.CommandType.CTX_MESSAGE)) {
								if (options.length < 25) {
									options.push({
										label: cmd.name,
										description: cmd.usage,
										value: cmd.name,
										default: commands.filter(c => c.name == cmd.name).size != 0
									});
								} else {
									const selectMenu = new MessageSelectMenu()
										.setCustomId('itshnik_si_chooser')
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
								.setCustomId('itshnik_si_chooser')
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
			}
		} else if (interaction.isSelectMenu()) {
			if (interaction.customId == "itshnik_si_chooser") {
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