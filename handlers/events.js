const { lstat, readdir } = require('fs/promises'),
      { join } = require('path');

module.exports.init = async (client) => {
    Log.send(`[HANDLER/EVENTS] Хандлер событий запущен.`);
    walk(client, './events/');
}

async function walk(client, dir) {
    if (Array.isArray(dir)) return;
    if ( !(await lstat(dir)).isDirectory() ) {
        const event = require(`../${dir}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
        Log.send(`[HANDLER/EVENTS] Слушатель "${event.name}" загружен.`);
        return;
    }
    for(let file of (await readdir(dir))) {
        await walk(client, join(dir, file));
    }
    return;
}
