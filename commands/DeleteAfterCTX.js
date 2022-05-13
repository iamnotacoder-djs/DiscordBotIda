'use strict';
const BaseCommand = require('../structures/BaseCommand');

class DeleteAfterCTX extends BaseCommand {
    
    name = "Удалить сообщения ниже...";
    usage = "Включает автоматическую чистку канала от сообщений - ниже указанного";
    type = [Config.CommandType.CTX_MESSAGE];
	category = [Config.CommandCategory.ADMIN];
    bot_permissions = [
        'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'
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
        if ([null, undefined].includes(client.db.get(`deleteafter`))) client.db.set(`deleteafter`, {});
        if ([null, undefined].includes(client.db.get(`deleteafter.channels`))) client.db.set(`deleteafter.channels`, {});
        if (client.db.get(`deleteafter.channels.${command.channel.id}`) == command.targetMessage.id) {
            client.db.set(`deleteafter.channels.${command.channel.id}`, null);
            command.reply({ content: `ID сообщения и канала удалены.`, ephemeral: true });
        } else {
            client.db.set(`deleteafter.channels.${command.channel.id}`, command.targetMessage.id);
            command.reply({ content: `ID сообщения и канала сохранены.`, ephemeral: true });
        }
    }

    async setupTimeouts(client) {
		client.timeout5m.add('deleteafter', async () => {
            let toDB = {},
                db = client.db.get(`deleteafter.channels`) ?? {},
                keys = Object.keys(db);
            for(let i = 0; i < keys.length; i++) {
                let k = keys[i];
                try {
                    const _channel = await client.channels.fetch(k);
                    const _message = await _channel.messages.fetch(db[k]);
                    toDB[k] = _message.id; // Канал и сообщение найдены
    
                    // Удаление сообщений
                    let found = false, 
                        message = await _channel.messages.fetch({ limit: 1 })
                            .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));
    
                    while (message && !found) {
                        let messagePage = await _channel.messages.fetch({ limit: 100, before: message.id });
                        for (let i = 0; i < messagePage.size; i++) {
                            let msg = messagePage.at(i);
                            if (msg.id == _message.id) {
                                found = true;
                            } else if (Date.now() - msg.createdTimestamp >= 1000 * 60 * 5 && !found) {
                                msg.delete();
                            }
                        }
                        message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
                    }
                } catch(e) {
                    // do nothing
                }
            }
            client.db.set(`deleteafter.channels`, toDB);
        });
        return true;
    }
}

module.exports = DeleteAfterCTX