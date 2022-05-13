'use strict';
const BaseCommand = require('../structures/BaseCommand'),
    { MessageEmbed, MessageAttachment } = require('discord.js');

class ConvertEmbedCTX extends BaseCommand {
    
    name = "Конвертировать в Embed";
    usage = "Конвертировать сообщение в Embed";
    type = [Config.CommandType.CTX_MESSAGE];
	category = [Config.CommandCategory.ADMIN];
    bot_permissions = [
        'SEND_MESSAGES', 'ATTACH_FILES'
    ];
    slash = { 
        name: this.name, 
        type: `MESSAGE`,
        defaultPermission: true 
    };

    constructor() {
        super();
    }

    async execute(client, command) {
        if (command.targetMessage.content.length == 0) return command.reply({ content: `Сообщение не содержит текста.`, ephemeral: true });
        
        let msg = command.targetMessage.content.split("\n"),
            title = msg[0],
            files = [];
        msg.shift();
        msg = msg.join("\n");
        let embed = new MessageEmbed()
            .setColor(Config.embed_color)
            .setTitle(`${title}`)
            .setDescription(`${msg}`);
        command.targetMessage.attachments.forEach((at) => {
            if (at.url.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gmi) !== null) {
                files.push(new MessageAttachment(at.url, at.name));
                embed.setImage(`attachment://${at.name}`);
            }
        });

        command.channel.send({ 
            embeds: [ embed ],
            files: files
        });

        command.reply({ content: `Опубликовано.`, ephemeral: true });
    }
}

module.exports = ConvertEmbedCTX