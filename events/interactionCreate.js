const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(client, interaction) {
        await Log.init(client);

        if (interaction.isCommand() || interaction.isContextMenu()) {
            const cmd = client.commands.get(interaction.commandName);
            if (cmd && ((cmd.type.includes(Config.CommandType.SLASH) || cmd.type.includes(Config.CommandType.SLASH_APPLICATION)) && interaction.isCommand() || cmd.type.includes(Config.CommandType.CTX_USER) && interaction.isContextMenu() || cmd.type.includes(Config.CommandType.CTX_MESSAGE) && interaction.isContextMenu())) {
                
                let perms_error = [];
                if (interaction.inGuild()) {
                    
                    // user_permissions
                    let perms_error_author = [];
                    cmd.user_permissions.forEach((perm) => {
                        if (!interaction.member.permissions.has(perm)) {
                            perms_error_author.push(perm);
                        }
                    });

                    const setted_roles = client.db.get(`guilds.g${interaction.guild.id}.admins`) ?? [];
                    if (cmd.category.includes(Config.CommandCategory.ADMIN)) {
                        if (setted_roles.length == 0) {
                            if (interaction.member.permissions.has('ADMINISTRATOR')) {
                                // ok
                            } else {
                                perms_error_author.push(`ADMINISTRATOR / MODERATOR`);
                            }
                        } else {
                            if (interaction.member.permissions.has('ADMINISTRATOR') || interaction.member.roles.cache.some(role => setted_roles.includes(role.id))) {
                                // ok
                            } else {
                                perms_error_author.push(`ADMINISTRATOR / MODERATOR`);
                            }
                        }
                    }

                    if (perms_error_author.length != 0) 
                        perms_error.push(`У тебя нет доступа к использованию команды \`${cmd.name}\`.\n||Требуемые права: ${perms_error_author.join(',')}||`);
                    
                    // bot_permissions
                    let perms_error_bot = [];
                    cmd.bot_permissions.forEach((perm) => {
                        if (!interaction.guild.me.permissions.has(perm)) {
                            perms_error_bot.push(perm);
                        }
                    });
                    if (perms_error_bot.length != 0) 
                        perms_error.push(`У меня (${client.user}) нет возможности выполнить команду \`${cmd.name}\`.\n||Требуемые права: ${perms_error_bot.join(',')}||`);

                    // summary
                    if (perms_error.length != 0) 
                        return interaction.reply({
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
                    return cmd.exec(client, interaction);
                } catch (err) {
                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`Ошибка выполнения команды ${command}`)
                                .setColor(Config.embed_color)
                        ],
                        ephemeral: true
                    });
                    Log.send(`[EVENT/INTERACTIONCREATE] Ошибка выполнения команды ${command}: ${err}`);
                }
            }
        } else {
            let found = false;
            client.commands.forEach((cmd) => {
                let regexName = false;
                cmd.componentsNames.forEach((name) => {
                    if (name.includes('...') && interaction.customId.includes(name.replace('...', ''))) regexName = true;
                });
                if ((cmd.componentsNames.includes(interaction.customId) || regexName) && cmd.componentListener(client, interaction)) found = true;
            });
            
            if (!found) defer(interaction);
        }
    }
}

async function defer(interaction) {
    if (!interaction.replied) interaction.deferUpdate();
}