const   { Client, Collection, Intents } = require("discord.js"),
        client = new Client({
            intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES ]
        }),
        discordModals = require('discord-modals'),
        Timeout = require("./structures/Timeout"),
        Logger = require("./structures/Logger");

global.Config = require("./config.json");
global.Log = new Logger();

client.login(Config.token)
    .then(async () => {
        await Log.init(client);
        Log.send(`[INDEX] Инициализация бота`);
        client.db = require('quick.db');
        client.commands = new Collection();
        client.timeout1h = new Timeout();
        discordModals(client)
        
        require(`./handlers/events.js`).init(client);
        require(`./handlers/commands.js`).init(client);
    });

client.on('error', Log.error)
client.on('warn', Log.error)
process.on('uncaughtException', Log.error);
process.on('unhandledRejection', Log.error);

module.exports = client;