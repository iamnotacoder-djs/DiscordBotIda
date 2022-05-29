'use strict';
const BaseCommand = require('../structures/BaseCommand');

class Purge extends BaseCommand {
    
    name = "очистка";
    usage = "Очистить канал от N последних сообщений";
    type = [Config.CommandType.CHAT, Config.CommandType.SLASH];
	category = [Config.CommandCategory.ADMIN];
    bot_permissions = [
        'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'
    ];
    options = [ 
        {
            name: "count",
            description: "Кол-во сообщений к удалению",
            type: "INTEGER",
            required: true
        }, {
            name: "user",
            description: "Почистить сообщения конкретного пользователя",
            type: "USER"
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
        let count = 0;
        let user = client.user;
        if (command.content != undefined) {
            let res = command.content.match(/( )([0-9].*)( )/gm);
            if (res?.length >= 1) count = parseInt(res[0].trim());
            command.mentions.users.forEach((u) => {
                if (u.id != user.id) user = u;
            });
        } else {
            let res = command.options.getInteger(`count`);
            if (res != null) count = res;
            user = command.options.getUser(`user`) ?? client.user;
        }
        if (count < 1) count = 1;

        // Получение базис сообщения
        let message = await command.channel.messages.fetch({ limit: 1 })
            .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));
        let c = 0;
        let messages = [];

        while (message || c < count) {
            let messagePage = await command.channel.messages.fetch({ limit: 100, before: message.id });
            for (let i = 0; i < messagePage.size; i++) {
                let msg = messagePage.at(i);
                // Если пользователь не указан
                if (user.id == client.user.id) {
                    if (c < count) {
                        messages.push(msg);
                        c++;
                    }
                } else {
                    if (c < count && msg.author.id == user.id) {
                        messages.push(msg);
                        c++;
                    }
                }
            }
            message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
        }
        for (let i = 0; i < messages.length; i++) {
            let m = messages[i];
            if (m.deletable) await m.delete();
        }

        command.reply({
            content: `> ${command.user.tag} (<@${command.user.id}>) удалил ${c} сообщений ${user.id == client.user.id? ``: `пользователя <@${user.id}> `}в канале <#${command.channel.id}> по админ-команде.`,
            ephemeral: true
        });
    }

}

module.exports = Purge