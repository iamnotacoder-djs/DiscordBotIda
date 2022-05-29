'use strict';
const BaseCommand = require('../structures/BaseCommand');

class Slowmode extends BaseCommand {
    
    name = "слоумод";
    usage = "Установить ограничение на отправку сообщений в канале";
    type = [Config.CommandType.CHAT, Config.CommandType.SLASH];
	category = [Config.CommandCategory.ADMIN];
    bot_permissions = [
        'MANAGE_CHANNELS'
    ];
    options = [ 
        {
            name: "time",
            description: "Время в секундах",
            type: "INTEGER"
        }
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
        let time = 0;
        if (command.content != undefined) {
            let res = command.content.match(/( )([0-9].*)( )/gm);
            if (res?.length >= 1) time = parseInt(res[0].trim());
        } else {
            let res = command.options.getInteger(`time`);
            if (res != null) time = res;
        }
        if (time < 0) time = 0;
        if (time > 60 * 60 * 6) time = 60 * 60 * 6;

        const channelLastDelay = command.channel.rateLimitPerUser;
        command.channel.setRateLimitPerUser(time, `${command.user.tag} установил слоумод в канале #${command.channel.name} c ${channelLastDelay} на ${time} секунд по админ-команде`);

        command.reply(`> ${command.user.tag} (<@${command.user.id}>) установил слоумод в канале <#${command.channel.id}> c ${channelLastDelay} на ${time} секунд по админ-команде.\n\nДанное сообщение продублировано в **Аудит сервера**`);
    }

}

module.exports = Slowmode