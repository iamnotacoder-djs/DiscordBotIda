const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        await Log.init(client);
        message.content = message.content.replace(`<@!${client.user.id}>`, ``).trim();
        const prefix = client.db.get(`guilds.g${message.guildId}.prefix`) ?? Config.prefix;
        if (!message.content.startsWith(prefix) || !message.content.startsWith(Config.prefix)) return;
        const args = message.content.slice(message.content.startsWith(prefix) ? prefix.length : Config.prefix).trim().split(/ +/g);
        const command = args.shift();
        const cmd = client.commands.get(command);

        if (cmd && cmd.type.includes(cmd.CommandType.CHAT)) {
            let perms_error = [];
            if (message.inGuild()) {
                
                // user_permissions
                let perms_error_author = [];
                cmd.user_permissions.forEach((perm) => {
                    if (!message.member.permissions.has(perm)) {
                        perms_error_author.push(perm);
                    }
                });
                if (perms_error_author.length != 0) 
                    perms_error.push(`У тебя нет доступа к использованию команды \`${cmd.name}\`.\n||Требуемые права: ${perms_error_author.join(',')}||`);
                
                // bot_permissions
                let perms_error_bot = [];
                cmd.bot_permissions.forEach((perm) => {
                    if (!message.guild.me.permissions.has(perm)) {
                        perms_error_bot.push(perm);
                    }
                });
                if (perms_error_bot.length != 0) 
                    perms_error.push(`У меня (${client.user}) нет возможности выполнить команду \`${cmd.name}\`.\n||Требуемые права: ${perms_error_bot.join(',')}||`);

                // summary
                if (perms_error.length != 0) 
                    return message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle(`Ошибка выполнения команды ${command}`)
                                .setDescription(`${perms_error.join('\n')}`)
                                .setColor(Config.embed_color)
                        ],
                        ephemeral: true
                    });
            }

            try {
                cmd.exec(client, message);
            } catch (err) {
                message.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Ошибка выполнения команды ${command}`)
                            .setColor(Config.embed_color)
                    ],
                    ephemeral: true
                });
                Log.send(`[EVENT/MESSAGECREATE] Ошибка выполнения команды ${command}: ${err}`);
            }
        }
    }
}