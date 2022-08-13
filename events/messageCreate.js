const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        await Log.init(client);
        message.content = message.content.replace(`<@!${client.user.id}>`, ``).trim();
        const prefix = Config.prefix;
        if (!message.content.startsWith(prefix) || !message.content.startsWith(Config.prefix)) return;
        const args = message.content.slice(message.content.startsWith(prefix) ? prefix.length : Config.prefix).trim().split(/ +/g);
        const command = args.shift();
        const cmd = client.commands.get(command);

        if (cmd && cmd.type.includes(Config.CommandType.CHAT)) {
            try {
                cmd.exec(client, message);
            } catch (err) {
                message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`Ошибка выполнения команды ${command}`)
                            .setColor(Config.embed_color)
                    ],
                    ephemeral: true
                });
                Log.send(`[EVENT/MESSAGECREATE] Ошибка выполнения команды ${command}: ${err}`);
            }
        }
    }
}