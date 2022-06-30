const   { Client, Collection, Intents } = require("discord.js"),
        client = new Client({
            intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS ]
        }),
        Timeout = require("./structures/Timeout"),
        Logger = require("./structures/Logger"),
        ConfigUtil = require("./structures/ConfigUtil");

global.Config = new ConfigUtil();
global.Log = new Logger();

client.login(Config.token)
    .then(async () => {
        await Log.init(client);
        Log.send(`[INDEX] Инициализация бота`);
        client.db = require('quick.db'); // quick.db@^7.1.3
        client.commands = new Collection();
        client.timeout5m = new Timeout(1000 * 60 * 5);
        client.timeout5m.start();
        
        require(`./handlers/events.js`).init(client);
        require(`./handlers/commands.js`).init(client);
    });

client.on('error', Log.error)
client.on('warn', Log.error)
process.on('uncaughtException', Log.error);
process.on('unhandledRejection', Log.error);

module.exports = client;