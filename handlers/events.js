const fs = require('fs');

module.exports.init = async (client) => {
    Log.send(`[HANDLER/EVENTS] Хандлер событий запущен.`);
    fs.readdirSync(`./events`).filter(s => !s.startsWith('_') && s.endsWith('.js')).forEach(file => {
        const event = require(`../events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
        Log.send(`[HANDLER/EVENTS] Слушатель "${event.name}" загружен.`);
    });
}