'use strict';
const 	BaseCommand = require('../structures/BaseCommand'),
		{ MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu } = require('discord.js'),
        { createCanvas, loadImage, registerFont } = require('canvas'),
        fs = require('fs');

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
    componentsNames = [`itshnik_sm`, `itshnik_sm_slash`, `itshnik_sm_admin_roles`, `itshnik_sm_sf`, `itshnik_sm_sf_banner`];

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
									}, 
									{
										label: `Server-features`,
										description: `Welcome - сообщения, баннер сервера итд итп`,
										value: `itshnik_sm_sf`
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
				} else if (interaction.values.includes(`itshnik_sm_sf`)) {
					let serverBanner = 
					client.db.get(`guilds.g${interaction.guild.id}.serverBanner`) ?? false;
					interaction.reply({
						components: [
							new MessageActionRow()
								.addComponents([
									new MessageSelectMenu()
										.setCustomId('itshnik_sm_sf')
										.setPlaceholder('Серверные фишки')
										.setMinValues(0)
										.setMaxValues(1)
										.addOptions([
											{
												label: `${!serverBanner? 'Включить': 'Выключить'} статус сервера в баннере`,
												description: `Включение/выключение статуса сервера в баннере`,
												value: `itshnik_sm_sf_banner`
											}
										])
								])
						], 
						ephemeral: true
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
			if (interaction.customId == "itshnik_sm_sf") {
				if (interaction.values.includes(`itshnik_sm_sf_banner`)) {
					let serverBanner = 
					!client.db.get(`guilds.g${interaction.guild.id}.serverBanner`) ?? false;
					client.db.set(`guilds.g${interaction.guild.id}.serverBanner`, serverBanner);

					let guilds = client.db.get(`guilds.serverBanner`) ?? [];
					if (serverBanner) {
						guilds.push(interaction.guild.id);
					} else {
						guilds = guilds.filter(ele => {
							return ele != interaction.guild.id;
						});
					}
					client.db.set(`guilds.serverBanner`, guilds);
					if (fs.existsSync(`./assets/guild_banners/${interaction.guild.id}.png`)) {
						fs.unlinkSync(`./assets/guild_banners/${interaction.guild.id}.png`);
					}
					interaction.reply({
						content: `Статус в баннере сервера ${serverBanner? 'включен': 'выключен'}`,
						ephemeral: true
					});
					return true;
				}
			}
		}
		return false;
    }

    async setupTimeouts(client) {
		client.timeout5m.add('ida', async () => {
			let guilds_ids = client.db.get(`guilds.serverBanner`) ?? [], 
				guilds_ids_new = [];
			guilds_ids = guilds_ids.filter(ele => { return typeof ele == 'string'; });
			for(let i = 0; i < guilds_ids.length; i++) {
				try {
					let guild = await client.guilds.fetch(guilds_ids[i]);
					guilds_ids_new.push(guild.id);

					if (((client.db.get(`guilds.g${guild.id}.membersCount`) ?? 0) != guild.memberCount) && guild.premiumSubscriptionCount >= 7) {
						client.db.set(`guilds.g${guild.id}.membersCount`, guild.memberCount);
						this.drawServerBanner(guild);
					}
				} catch (e) {
					Log.error(e);
				}
			}
			client.db.set(`guilds.serverBanner`, guilds_ids_new);
        });
        return true;
    }
	
	async drawServerBanner(guild) {
		let imageBg, imageOverlay;
		try {
			// load overlays
			let pathBg = guild.bannerURL({ format: 'png', size: 1024 });
			if (fs.existsSync(`./assets/guild_banners/${guild.id}.png`)) {
				pathBg = `./assets/guild_banners/${guild.id}.png`;
			}
			imageBg = await loadImage(pathBg);
			imageOverlay = await loadImage(`./assets/guild_banner_overlay.png`);
		} catch (e) {
			return;
		}

		const canvas = createCanvas(960, 540);
		const context = canvas.getContext('2d');
		context.fillStyle = '#000000';
		context.fillRect(0, 0, 960, 540);

		context.drawImage(imageBg, 0, 0, 960, 540);
		if (!fs.existsSync(`./assets/guild_banners/${guild.id}.png`)) fs.writeFileSync(`./assets/guild_banners/${guild.id}.png`, canvas.toBuffer('image/png'));
		context.drawImage(imageOverlay, 0, 0, 960, 540);

		// Members Count
		let membersCount = `${guild.memberCount}`;
		registerFont('./assets/ponteralt.ttf', { family: 'PonterAlt' });
		context.font = '78pt PonterAlt';
		context.textAlign = 'left';
		context.fillStyle = '#000';
		context.fillText(membersCount, 236, 470);
		context.fillStyle = '#fff';
		context.fillText(membersCount, 234, 468);
		guild.setBanner(canvas.toBuffer('image/png'))
			.then((updated) => {
				Log.send(`Updated the guild banner for ${guild.name} (${guild.id})`);
			})
			.catch(Log.error);
	}
}

module.exports = ITshnik