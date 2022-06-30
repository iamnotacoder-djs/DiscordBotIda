'use strict';
const BaseCommand = require('../structures/BaseCommand'),
    { MessageEmbed, Modal, MessageActionRow, TextInputComponent, MessageButton } = require('discord.js'),
    { createCanvas, loadImage } = require('canvas');

class PersonalRole extends BaseCommand {
    
    name = "роль";
    usage = "Настройка личной роли для сервер-саппортов";
    type = [Config.CommandType.SLASH];
	category = [Config.CommandCategory.FUN];
    bot_permissions = [
        'SEND_MESSAGES',
        'MANAGE_ROLES'
    ];
    slash = { 
        name: this.name, 
        description: this.usage, 
        type: `CHAT_INPUT`, 
        options: this.options, 
        defaultPermission: true 
    };
    componentsNames = ['cmd_supportrole_create', 'cmd_supportrole_delete', 'cmd_supportrole_settings', 'cmd_supportrole_settings_name', 'cmd_supportrole_settings_emoji', 'cmd_supportrole_settings_color', 'cmd_supportrole_settings_hoist'];

    constructor() {
        super();
    }

    async execute(client, command) {
        if ([null, undefined].includes(client.db.get(`support_roles`))) client.db.set(`support_roles`, {});
        if ([null, undefined].includes(client.db.get(`support_roles.g_${command.guild.id}`))) client.db.set(`support_roles.g_${command.guild.id}`, {});

        const guild = await client.guilds.fetch(command.guild.id);
        guild.members.fetch(command.user.id)
            .then(async (member) => {
                if (guild.premiumSubscriptionCount > 0 && member.roles.cache.some(r => r.id == guild.roles.premiumSubscriberRole.id)) {
                    let reply = this.getMenu(client, member);
                    reply.fetchReply = true;
                    const m = await command.reply(reply);
                    client.db.set(`support_roles.g_${command.guild.id}.messages.u_${member.id}`, {
                        message: m.id,
                        channel: m.channel.id
                    });
                } else {
                    command.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor(Config.embed_color)
                                .setTitle(`Личная роль`)
                                .setDescription(`Для доступа к команде требуется быть бустером сервера.`)
                        ],
                        ephemeral: true
                    });
                }
            });
    }

    componentListener(client, interaction) {
        if (interaction.member.roles.cache.some(r => r.id == interaction.member.guild.roles.premiumSubscriberRole.id)) {
            if (interaction.isButton()) {
                if (interaction.customId == "cmd_supportrole_create") {
                    this.deleteRole(client, interaction.member)
                        .then(() => {
                            this.createRole(client, interaction.member)
                                .then(() => {
                                    interaction.reply({
                                        content: `Роль создана и выдана`,
                                        ephemeral: true
                                    });
                                    this.updateMenuMessage(client, interaction.member);
                                });
                        });
                    return true;
                }
                if (interaction.customId == "cmd_supportrole_delete") {
                    this.deleteRole(client, interaction.member)
                        .then(() => {
                            interaction.reply({
                                content: `Роль удалена`,
                                ephemeral: true
                            });
                            this.updateMenuMessage(client, interaction.member);
                        })
                    return true;
                }
                if (interaction.customId == "cmd_supportrole_settings_name") {
                    interaction.showModal(
                        new Modal()
                            .setCustomId('cmd_supportrole_settings_name')
                            .setTitle('Личная роль')
                            .setComponents([
                                new MessageActionRow()
                                    .addComponents(
                                        new TextInputComponent()
                                            .setCustomId('name')
                                            .setLabel('Название роли')
                                            .setStyle('SHORT') // 'SHORT' or 'PARAGRAPH'
                                            .setMinLength(2)
                                            .setMaxLength(20)
                                            .setPlaceholder(interaction.member.displayName)
                                            .setRequired(true)
                                    )
                            ])
                    );
                    return true;
                }
                if (interaction.customId == "cmd_supportrole_settings_emoji") {
                    interaction.showModal(
                        new Modal()
                            .setCustomId('cmd_supportrole_settings_emoji')
                            .setTitle('Личная роль')
                            .setComponents([
                                new MessageActionRow()
                                    .addComponents(
                                        new TextInputComponent()
                                            .setCustomId('emoji')
                                            .setLabel('Ссылка на иконку')
                                            .setStyle('SHORT') // 'SHORT' or 'PARAGRAPH'
                                            .setMinLength(10)
                                            .setPlaceholder(`https://imgur.com/test.png`)
                                            .setRequired(true)
                                    )
                            ])
                    );
                    return true;
                }
                if (interaction.customId == "cmd_supportrole_settings_color") {
                    interaction.showModal(
                        new Modal()
                            .setCustomId('cmd_supportrole_settings_color')
                            .setTitle('Личная роль')
                            .setComponents([
                                new MessageActionRow()
                                    .addComponents(
                                        new TextInputComponent()
                                            .setCustomId('color')
                                            .setLabel('Цвет в HEX формате')
                                            .setStyle('SHORT') // 'SHORT' or 'PARAGRAPH'
                                            .setMinLength(4)
                                            .setMaxLength(7)
                                            .setPlaceholder(`#ffffff`)
                                            .setRequired(true)
                                    )
                            ])
                    );
                    return true;
                }
                if (interaction.customId == "cmd_supportrole_settings_hoist") {
                    interaction.showModal(
                        new Modal()
                            .setCustomId('cmd_supportrole_settings_hoist')
                            .setTitle('Личная роль')
                            .setComponents([
                                new MessageActionRow()
                                    .addComponents(
                                        new TextInputComponent()
                                            .setCustomId('hoist')
                                            .setLabel('Выделять от других ролей в списке')
                                            .setStyle('SHORT') // 'SHORT' or 'PARAGRAPH'
                                            .setMinLength(2)
                                            .setMaxLength(3)
                                            .setPlaceholder(`да/нет`)
                                            .setRequired(true)
                                    )
                            ])
                    );
                    return true;
                }
                if (interaction.customId == "cmd_supportrole_settings") {
                    let components = [
                        new MessageActionRow()
                            .addComponents(
                                new TextInputComponent()
                                    .setCustomId('name')
                                    .setLabel('Название роли')
                                    .setStyle('SHORT') // 'SHORT' or 'PARAGRAPH'
                                    .setMinLength(2)
                                    .setMaxLength(20)
                                    .setPlaceholder(interaction.member.displayName)
                                    .setRequired(true)
                            ),
                        new MessageActionRow()
                            .addComponents(
                                new TextInputComponent()
                                    .setCustomId('emoji')
                                    .setLabel('Ссылка на иконку')
                                    .setStyle('SHORT') // 'SHORT' or 'PARAGRAPH'
                                    .setMinLength(10)
                                    .setPlaceholder(`https://images.boosty.to/user/5832250/avatar`)
                                    .setRequired(true)
                            ),
                        new MessageActionRow()
                            .addComponents(
                                new TextInputComponent()
                                    .setCustomId('color')
                                    .setLabel('Цвет в HEX формате')
                                    .setStyle('SHORT') // 'SHORT' or 'PARAGRAPH'
                                    .setMinLength(4)
                                    .setMaxLength(7)
                                    .setPlaceholder(`#ffffff`)
                                    .setRequired(true)
                            ),
                        new MessageActionRow()
                            .addComponents(
                                new TextInputComponent()
                                    .setCustomId('hoist')
                                    .setLabel('Выделять от других ролей в списке')
                                    .setStyle('SHORT') // 'SHORT' or 'PARAGRAPH'
                                    .setMinLength(2)
                                    .setMaxLength(3)
                                    .setPlaceholder(`да/нет`)
                                    .setRequired(true)
                            )
                    ];
                    interaction.showModal(
                        new Modal()
                            .setCustomId('cmd_supportrole_settings')
                            .setTitle('Личная роль')
                            .setComponents(components)
                    );
                    return true;
                }
            }
            if (interaction.isModalSubmit()) {
                if (interaction.customId == "cmd_supportrole_settings_name") {
                    const name = interaction.fields.getTextInputValue('name') ?? `role`;
                    client.db.set(`support_roles.g_${interaction.guild.id}.u_${interaction.member.id}.name`, name);
                    this.setRoleName(client, interaction.member)
                        .then(() => {
                            this.updateMenuMessage(client, interaction.member);
                            interaction.reply({
                                content: `Роль обновлена`,
                                ephemeral: true
                            });
                        });
                    return true;
                }
                if (interaction.customId == "cmd_supportrole_settings_emoji") {
                    const emoji = interaction.fields.getTextInputValue('emoji') ?? ``;
                    if (this.validURL(emoji)) {
                        client.db.set(`support_roles.g_${interaction.guild.id}.u_${interaction.member.id}.emojiURL`, emoji);
                        this.setRoleEmoji(client, interaction.member)
                            .then(() => {
                                this.updateMenuMessage(client, interaction.member);
                                interaction.reply({
                                    content: `Роль обновлена`,
                                    ephemeral: true
                                });
                            });
                    } else {
                        interaction.reply({
                            content: `В строке:\n\`\`\`${emoji}\`\`\`Мы не смогли распознать ссылку на изображение. `,
                            ephemeral: true
                        });
                    }
                    return true;
                }
                if (interaction.customId == "cmd_supportrole_settings_color") {
                    const color = interaction.fields.getTextInputValue('color') ?? `#ffffff`;
                    const regHex = /^#([0-9a-f]{3}){1,2}$/i;
                    if (regHex.test(color)) {
                        client.db.set(`support_roles.g_${interaction.guild.id}.u_${interaction.member.id}.color`, color);
                        this.setRoleColor(client, interaction.member)
                            .then(() => {
                                this.updateMenuMessage(client, interaction.member);
                                interaction.reply({
                                    content: `Роль обновлена`,
                                    ephemeral: true
                                });
                            });
                    } else {
                        interaction.reply({
                            content: `В строке:\n\`\`\`${color}\`\`\`Мы не смогли распознать цвет в формате HEX. `,
                            ephemeral: true
                        });
                    }
                    return true;
                }
                if (interaction.customId == "cmd_supportrole_settings_hoist") {
                    const _hoist = interaction.fields.getTextInputValue('hoist') ?? `нет`;
                    let hoist = false;
                    if (['да', 'даа', 'дда', 'yes', 'yep', '+', '+++', '++'].includes(_hoist.toLowerCase())) {
                        hoist = true
                    }
                    if (interaction.member.roles.cache.some(r => r.id == interaction.member.guild.roles.premiumSubscriberRole.id)) {
                        client.db.set(`support_roles.g_${interaction.guild.id}.u_${interaction.member.id}.hoist`, hoist);
                        this.setRoleHoist(client, interaction.member)
                            .then(() => {
                                this.updateMenuMessage(client, interaction.member);
                                interaction.reply({
                                    content: `Роль обновлена`,
                                    ephemeral: true
                                });
                            });
                    } else {
                        interaction.reply({
                            content: `Для доступа к меню требуется роль в наличии: <@&${interaction.member.guild.roles.premiumSubscriberRole.id}>`,
                            ephemeral: true
                        });
                    }
                    return true;
                }
                if (interaction.customId == "cmd_supportrole_settings") {
                    (async () => {
                        const name = interaction.fields.getTextInputValue('name') ?? `role`;
                        client.db.set(`support_roles.g_${interaction.guild.id}.u_${interaction.member.id}.name`, name);
                        await this.setRoleName(client, interaction.member);

                        const emoji = interaction.fields.getTextInputValue('emoji') ?? ``;
                        if (this.validURL(emoji)) {
                            client.db.set(`support_roles.g_${interaction.guild.id}.u_${interaction.member.id}.emojiURL`, emoji);
                            await this.setRoleEmoji(client, interaction.member);
                        }
                        
                        const color = interaction.fields.getTextInputValue('color') ?? `#ffffff`;
                        const regHex = /^#([0-9a-f]{3}){1,2}$/i;
                        if (regHex.test(color)) {
                            client.db.set(`support_roles.g_${interaction.guild.id}.u_${interaction.member.id}.color`, color);
                            await this.setRoleColor(client, interaction.member);
                        }

                        if (interaction.fields.components.length > 3) {
                            const _hoist = interaction.fields.getTextInputValue('hoist') ?? `нет`;
                            let hoist = false;
                            if (['да', 'даа', 'дда', 'yes', 'yep', '+', '+++', '++'].includes(_hoist.toLowerCase())) {
                                hoist = true
                            }
                            if (interaction.member.roles.cache.some(r => r.id == interaction.member.guild.roles.premiumSubscriberRole.id)) {
                                client.db.set(`support_roles.g_${interaction.guild.id}.u_${interaction.member.id}.hoist`, hoist);
                                await this.setRoleHoist(client, interaction.member);
                            }
                        }
                        this.updateMenuMessage(client, interaction.member);
                        interaction.reply({
                            content: `Роль обновлена`,
                            ephemeral: true
                        });
                    })()
                    return true;
                }
            }
        } else {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(Config.embed_color)
                        .setTitle(`Личная роль`)
                        .setDescription(`Для доступа к меню требуется роль в наличии: <@&${interaction.member.guild.roles.premiumSubscriberRole.id}>`)
                ],
                ephemeral: true
            });
            return true;
        }
        return false;
    }

    async deleteRole(client, member) {
        return new Promise((resolve, reject) => {
            if ([null, undefined].includes(client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`))) client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                color: `#ffffff`,
                name: `role`,
                emojiURL: ``,
                hoist: false
            });
            let role = client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`);            
            if (role.id == undefined) {
                resolve();
            } else {
                member.guild.roles.fetch(role.id)
                    .then((supportRole) => {
                        if (supportRole.editable) supportRole.delete();
                        client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                            color: role.color,
                            name: role.name,
                            emojiURL: role.emojiURL,
                            hoist: role.hoist
                        });
                        resolve();
                    })
                    .catch((e) => {
                        client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                            color: role.color,
                            name: role.name,
                            emojiURL: role.emojiURL,
                            hoist: role.hoist
                        });
                        resolve();
                    })
            }
        });
    }

    async createRole(client, member) {
        return new Promise((resolve, reject) => {
            if ([null, undefined].includes(client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`))) client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                color: `#ffffff`,
                name: `role`,
                emojiURL: ``,
                hoist: false
            });
            let role = client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`);
            const _role_premium = member.guild.roles.premiumSubscriberRole;
            member.guild.roles.create({
                    name: role.name,
                    color: role.color,
                    position: (_role_premium.position + 1),
                    hoist: role.hoist
                })
                .then((supportRole) => {
                    member.roles.add(supportRole);
                    client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}.id`, supportRole.id);
                    this.setRoleEmoji(client, member);
                    resolve();
                })
                .catch(() => { resolve(); });
        });
    }

    async setRoleEmoji(client, member) {
        return new Promise((resolve, reject) => {
            if ([null, undefined].includes(client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`))) client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                color: `#ffffff`,
                name: `role`,
                emojiURL: ``,
                hoist: false
            });
            let role = client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`);
            if (member.guild.premiumSubscriptionCount >= 7 && role.id != undefined) {
                if (this.validURL(role.emojiURL)) {
                    loadImage(role.emojiURL)
                        .then((icon) => {
                            const canvas = createCanvas(64, 64);
                            const context = canvas.getContext('2d');
                            context.drawImage(icon, 0, 0, 64, 64);
                            const buffer = canvas.toBuffer('image/png');
                            member.guild.roles.fetch(role.id)
                                .then((supportRole) => {
                                    supportRole.setIcon(buffer);
                                    resolve();
                                })
                                .catch((e) => {
                                    client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                                        color: role.color,
                                        name: role.name,
                                        emojiURL: role.emojiURL,
                                        hoist: role.hoist
                                    });
                                    resolve();
                                });
                        })
                        .catch((e) => {
                            resolve();
                        });
                }
            } else {
                resolve();
            }
        });
    }

    async setRoleName(client, member) {
        return new Promise((resolve, reject) => {
            if ([null, undefined].includes(client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`))) client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                color: `#ffffff`,
                name: `role`,
                emojiURL: ``,
                hoist: false
            });
            let role = client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`);
            if (role.id != undefined) {
                member.guild.roles.fetch(role.id)
                    .then((supportRole) => {
                        supportRole.setName(role.name);
                        resolve();
                    })
                    .catch((e) => {
                        client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                            color: role.color,
                            name: role.name,
                            emojiURL: role.emojiURL,
                            hoist: role.hoist
                        });
                        resolve();
                    });
            } else {
                resolve();
            }
        });
    }

    async setRoleColor(client, member) {
        return new Promise((resolve, reject) => {
            if ([null, undefined].includes(client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`))) client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                color: `#ffffff`,
                name: `role`,
                emojiURL: ``,
                hoist: false
            });
            let role = client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`);
            if (role.id != undefined) {
                member.guild.roles.fetch(role.id)
                    .then((supportRole) => {
                        supportRole.setColor(role.color);
                        resolve();
                    })
                    .catch((e) => {
                        client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                            color: role.color,
                            name: role.name,
                            emojiURL: role.emojiURL,
                            hoist: role.hoist
                        });
                        resolve();
                    });
            } else {
                resolve();
            }
        });
    }

    async setRoleHoist(client, member) {
        return new Promise((resolve, reject) => {
            if ([null, undefined].includes(client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`))) client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                color: `#ffffff`,
                name: `role`,
                emojiURL: ``,
                hoist: false
            });
            let role = client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`);
            if (role.id != undefined) {
                member.guild.roles.fetch(role.id)
                    .then((supportRole) => {
                        supportRole.setHoist(role.hoist);
                        resolve();
                    })
                    .catch((e) => {
                        client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
                            color: role.color,
                            name: role.name,
                            emojiURL: role.emojiURL,
                            hoist: role.hoist
                        });
                        resolve();
                    });
            } else {
                resolve();
            }
        });
    }

    async updateMenuMessage(client, member) {
        let reply = client.db.get(`support_roles.g_${member.guild.id}.messages.u_${member.id}`);
        client.channels.fetch(reply.channel)
            .then((channel) => {
                channel.messages.fetch(reply.message)
                    .then((message) => {
                        message.edit(this.getMenu(client, member)).catch(() => {});;
                    })
                    .catch(() => {});
            })
            .catch(() => {});
    }

    getMenu(client, member) {
        if ([null, undefined].includes(client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`))) client.db.set(`support_roles.g_${member.guild.id}.u_${member.id}`, {
            color: `#ffffff`,
            name: `role`,
            emojiURL: ``,
            hoist: false
        });
        let role = client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`), 
            roleDescription = `> <@&${role.id}>\n> `,
            components = [
                new MessageActionRow()
            ];
        
        if (role.id == undefined) {
            roleDescription = `> **Роль не создана**\n> `;
            components[0].addComponents(
                new MessageButton()
                    .setCustomId(`cmd_supportrole_create`)
                    .setLabel(`Создать роль`) 
                    .setStyle("PRIMARY")
            )
        } else {
            components[0].addComponents(
                new MessageButton()
                    .setCustomId(`cmd_supportrole_delete`)
                    .setLabel(`Удалить роль`) 
                    .setStyle("PRIMARY")
            )
        }
        components[0].addComponents(
            new MessageButton()
                .setCustomId(`cmd_supportrole_settings`)
                .setLabel(`Настроить роль`) 
                .setStyle("PRIMARY")
        )
        components.push(
            new MessageActionRow()
                .addComponents([
                    new MessageButton()
                        .setCustomId(`cmd_supportrole_settings_name`)
                        .setLabel(`Название`) 
                        .setStyle("SECONDARY"),
                    new MessageButton()
                        .setCustomId(`cmd_supportrole_settings_color`)
                        .setLabel(`Цвет`) 
                        .setStyle("SECONDARY"),
                    new MessageButton()
                        .setCustomId(`cmd_supportrole_settings_emoji`)
                        .setLabel(`Иконка`) 
                        .setStyle("SECONDARY"),
                    new MessageButton()
                        .setCustomId(`cmd_supportrole_settings_hoist`)
                        .setLabel(`Hoist`) 
                        .setStyle("SECONDARY")
                ])
        )
        roleDescription += `\n> **Название:** ${role.name}\n> **Цвет:** ${role.color}\n> **Иконка:** ${role.emojiURL == `` ? `Не установлена` : role.emojiURL}\n> **Выделение в списке:** ${role.hoist ? "Включено" : "Выключено"}`;

        return {
            embeds: [
                new MessageEmbed()
                    .setColor(Config.embed_color)
                    .setTitle(`Личная роль`)
                    .setDescription(`Роль <@${member.id}>\n\n${roleDescription}`)
            ],
            components: components
        };
    }
    
	validURL(str) {
		var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
		  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
		  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
		  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
		  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
		  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
		return !!pattern.test(str) && (str.match(/\.(jpeg|jpg|gif|png)$/) != null);
	}

}

module.exports = PersonalRole