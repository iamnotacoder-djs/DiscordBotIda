const   { Client, Collection, IntentsBitField } = require("discord.js"), // ^14.3.0
        client = new Client({
            intents: [ IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.DirectMessages ]
        }),
		{ QuickDB } = require("quick.db"), // ^9.0.6
        // Timeout = require("./structures/Timeout"),
        Logger = require("./structures/Logger"),
        ConfigUtil = require("./structures/ConfigUtil");

require('dotenv').config()
global.Config = new ConfigUtil();
global.Log = new Logger();
client.commands = new Collection();
client.db = new QuickDB();

client.login(process.env.TOKEN)
    .then(async () => {
        await Log.init(client);
        Log.send(`[INDEX] Инициализация бота`);
        require(`./handlers/events.js`).init(client);
        require(`./handlers/commands.js`).init(client);
    });

client.on('error', Log.error)
client.on('warn', Log.error)
process.on('uncaughtException', Log.error);
process.on('unhandledRejection', Log.error);

module.exports = client;
