const   { lstat, readdir } = require('fs/promises'),
        { join } = require('path'),
        BaseCommand = require('../structures/BaseCommand');

module.exports.init = async (client) => {
    Log.send(`[HANDLER/EVENTS] Хандлер Slash-комманд запущен.`);
    const slashes = await walk(client, './commands/').catch(console.error);
    client.application.commands.set(slashes)
        .then(() => {
            Log.send(`[HANDLER/COMMANDS] Установлено ${slashes.length} глобальных slash-комманд.`);
        })
        .catch((e) => {
            Log.error(`[HANDLER/COMMANDS] Ошибка установки глобальных slash-комманд: ${e}`);
        });
    Log.send(`[HANDLER/COMMANDS] Загружено ${client.commands.size} комманд.`);
}

async function walk(client, dir, slashes = []) {
    if (Array.isArray(dir)) return slashes;
    if ( !(await lstat(dir)).isDirectory() ) {
		const cmdClass = require(`../${dir}`);
		const cmd = new cmdClass();
		if (cmd instanceof BaseCommand) {
			client.commands.set(cmd.name, cmd);
			if (cmd.type.includes(Config.CommandType.SLASH_APPLICATION)) 
				slashes.push(cmd.slash);
		}
        return slashes;
    }
    for(let file of (await readdir(dir))) {
        await walk(client, join(dir, file), slashes);
    }
    return slashes;
}
