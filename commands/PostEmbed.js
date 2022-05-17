'use strict';
const BaseCommand = require('../structures/BaseCommand'),
    { MessageEmbed, MessageAttachment, Modal, MessageActionRow, TextInputComponent } = require('discord.js');

class PostEmbed extends BaseCommand {
    
    name = "эмбед";
    usage = "Опубликовать Embed";
    type = [Config.CommandType.CHAT, Config.CommandType.SLASH];
	category = [Config.CommandCategory.ADMIN];
    bot_permissions = [
        'SEND_MESSAGES', 'ATTACH_FILES'
    ];
    options = [ 
        {
            name: "avatar",
            description: "Отобразить автора сообщения (имя, аватар)",
            type: "BOOLEAN"
        }, {
            name: "server",
            description: "Отобразить логотип сервера в Thumbnail",
            type: "BOOLEAN"
        }
    ];
    slash = { 
        name: this.name, 
        description: this.usage, 
        type: `CHAT_INPUT`, 
        options: this.options, 
        defaultPermission: true 
    };
    componentsNames = ['cmd_postembed_modal'];

    constructor() {
        super();
    }

    async execute(client, command) {
        if (command.content != undefined) {
            try {
                let probalbyJSON = command.content.substring(command.content.indexOf("{"), command.content.lastIndexOf("}") + 1),
                    embed = new MessageEmbed(),
                    json = JSON.parse(probalbyJSON);
                if (json.title != undefined && json.title.length <= 256) embed.setTitle(json.title);
                if (json.color != undefined) {
                    embed.setColor(json.color);
                } else {
                    embed.setColor(Config.embed_color);
                }
                if (json.description != undefined && json.description.length <= 4600) embed.setDescription(json.description);
                if (json.url != undefined) embed.setURL(json.url);
                if (json.author != undefined && json.author.name != undefined && json.author.name.length <= 256) {
                    embed.setAuthor({
                        name: json.author.name,
                        url: json.author.url ?? null,
                        icon_url: json.author.icon_url ?? null
                    })
                }
                if (json.footer != undefined && json.footer.text != undefined && json.footer.text.length <= 2048) {
                    embed.setFooter({
                        text: json.footer.text,
                        icon_url: json.footer.icon_url ?? null
                    })
                }
                if (json.fields != undefined && json.fields.length <= 25 && json.fields.every(elem => elem.name != undefined && elem.name.length <= 256 && elem.value != undefined && elem.value.length <= 1000)) embed.setFields(json.fields);
                return command.channel.send({
                    embeds: [embed]
                });
            } catch (e) {
                return command.reply({
                    content: `Сообщение не является корректным JSON кодом для создания Embed'a.${`${e}`.includes("SyntaxError") ? `\n\`\`\`js\n${e}\`\`\``: ``}\n<https://leovoel.github.io/embed-visualizer/>`,
                    ephemeral: true
                });
            }
        } else {
            let avatar = command.options.getBoolean(`avatar`) ?? false,
                server = command.options.getBoolean(`server`) ?? false;
            if ([null, undefined].includes(client.db.get(`postembed`))) client.db.set(`postembed`, {});
            if ([null, undefined].includes(client.db.get(`postembed.spawns`))) client.db.set(`postembed.spawns`, {});
            client.db.set(`postembed.spawns.u${command.user.id}`, {
                avatar: avatar,
                server: server
            });
            
            let components = [
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('title')
                        .setLabel('Заголовок')
                        .setStyle('SHORT') 
                        .setMaxLength(256)
                        .setPlaceholder('Заголовок')
                    ),
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('description')
                        .setLabel('description')
                        .setStyle('PARAGRAPH') // 'SHORT' or 'PARAGRAPH'
                        .setMaxLength(4000)
                        .setPlaceholder('Описание')
                    ),
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('color')
                        .setLabel('#HEX значение цвета')
                        .setStyle('SHORT') // 'SHORT' or 'PARAGRAPH'
                        .setMinLength(6)
                        .setMaxLength(7)
                        .setPlaceholder('#FFFFFF')
                    ),
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('image')
                        .setLabel('Ссылка на изображение')
                        .setStyle('SHORT') // 'SHORT' or 'PARAGRAPH'
                        .setPlaceholder('http://iamnotacoder.ru/wp-content/uploads/2022/02/modals-1200x675.png')
                )
            ];
            if (!server) {
                components.push(
                    new MessageActionRow().addComponents(
                        new TextInputComponent()
                            .setCustomId('footer')
                            .setLabel('Футер')
                            .setStyle('SHORT') // 'SHORT' or 'PARAGRAPH'
                            .setMaxLength(2048)
                            .setPlaceholder('Футер')
                    )
                );
            }
            return command.showModal(
                new Modal()
                    .setCustomId('cmd_postembed_modal')
                    .setTitle('Опубликовать Embed')
                    .setComponents(components)
            );
        }
    }

    componentListener(client, interaction) {
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'cmd_postembed_modal') {
                interaction.deferReply({ ephemeral: true })
                    .then(() => {
                        const 	title = interaction.fields.getTextInputValue('title') ?? ``, 
                                description = interaction.fields.getTextInputValue('description') ?? ``,
                                footer = interaction.fields.components.some((c) => c.components[0].customId == "footer") ? interaction.fields.getTextInputValue('footer'): ``,
                                color = interaction.fields.getTextInputValue('color') ?? ``,
                                image = interaction.fields.getTextInputValue('image') ?? ``,
                                presets = client.db.get(`postembed.spawns.u${interaction.user.id}`); // avatar, server
                        let embed = new MessageEmbed();
                        if (title.length > 0) embed.setTitle(title);
                        if (description.length > 0) embed.setDescription(description);
                        if (footer.length > 0) embed.setFooter({
                            text: footer
                        });
                        if (footer.length > 0) embed.setFooter({
                            text: footer
                        });
                        const reg = /^#([0-9a-f]{3}){1,2}$/i;
                        if (reg.test(color)) {
                            embed.setColor(color);
                        } else {
                            embed.setColor(Config.embed_color);
                        }
                        let files = [];
                        if (image.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gmi) !== null) {
                            files.push(new MessageAttachment(image, 'file.png'));
                            embed.setImage('attachment://file.png')
                        }
                        if (presets.avatar) {
                            embed.setAuthor({
                                name: interaction.member.displayName, 
                                iconURL: interaction.member.displayAvatarURL(),
                                url: `https://discordapp.com/users/${interaction.user.id}/`
                            })
                        }
                        if (presets.server) {
                            embed.setFooter({
                                text: interaction.guild.name, 
                                iconURL: interaction.guild.iconURL
                            })
                        }
                        interaction.channel.send({
                            embeds: [embed],
                            files: files
                        })
                        interaction.followUp({ content: `Опубликовано.`, ephemeral: true });
                    });          
                return true;
            }
        }
        return false;
    }

}

module.exports = PostEmbed