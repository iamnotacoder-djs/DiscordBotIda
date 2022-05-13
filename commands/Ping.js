'use strict';
const BaseCommand = require('../structures/BaseCommand');

class Ping extends BaseCommand {
    
    name = "пинг";
    usage = "Показывает задержку бота";
    type = [Config.CommandType.CHAT, Config.CommandType.SLASH];
	category = [Config.CommandCategory.BOT];
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
        command.reply(`🏓 Задержка ${Date.now() - command.createdTimestamp}ms. API: ${Math.round(client.ws.ping)}ms`);
    }

}

module.exports = Ping