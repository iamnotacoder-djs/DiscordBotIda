const fs = require('fs');
const BaseCommand = require('../structures/BaseCommand');

module.exports.init = async (client) => {
    Log.send(`[HANDLER/COMMANDS] Хандлер Slash-комманд запущен.`);
    let slashes = [];
    fs.readdirSync(`./commands`).filter(s => !s.startsWith('_') && s.endsWith('.js')).forEach(file => {
		const cmdClass = require(`../commands/${file}`);
		const cmd = new cmdClass();
		if (cmd instanceof BaseCommand) {
			client.commands.set(cmd.name, cmd);
			cmd.setupTimeouts(client);
			if (cmd.type.includes(Config.CommandType.SLASH_APPLICATION)) 
				slashes.push(cmd.slash);
		}
    });
    client.application.commands.set(slashes)
        .then(() => {
            Log.send(`[HANDLER/COMMANDS] Установлено ${slashes.length} дефолтных slash-комманд.`);
        })
        .catch((err) => {
            Log.send(`[HANDLER/COMMANDS] Ошибка установки дефолтных slash-комманд: ${err}`);
        });
    Log.send(`[HANDLER/COMMANDS] Загружено ${client.commands.size} комманд.`);
}