'use strict';
const BaseCommand = require('../structures/BaseCommand');

class Prefix extends BaseCommand {
    
    name = "префикс";
    usage = "Показать префикс бота";
    type = [Config.CommandType.CHAT, Config.CommandType.SLASH];
	category = [Config.CommandCategory.SERVER];
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

    constructor() {
        super();
    }

    async execute(client, command) {
        let inGuild = `**Узнать префикс на сервере** \`[ida!префикс]\``;
        if (command.inGuild()) {
            inGuild = `**На сервере** \`[${client.db.get(`guilds.g${command.guildId}.prefix`) ?? Config.prefix}]\``;
        }
        command.reply(`**Глабальный префикс** \`[ida!]\`\n${inGuild}`);
    }

}

module.exports = Prefix