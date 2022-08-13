const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(client, interaction) {
        await Log.init(client);

        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
            const cmd = client.commands.get(interaction.commandName);
            if (cmd && ((cmd.type.includes(Config.CommandType.SLASH) || cmd.type.includes(Config.CommandType.SLASH_APPLICATION)) && interaction.isChatInputCommand() || cmd.type.includes(Config.CommandType.CTX_USER) && interaction.isUserContextMenuCommand() || cmd.type.includes(Config.CommandType.CTX_MESSAGE) && interaction.isMessageContextMenuCommand())) {
                
                try {
                    return cmd.exec(client, interaction);
                } catch (err) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`Ошибка выполнения команды ${cmd.name}`)
                                .setColor(Config.embed_color)
                        ],
                        ephemeral: true
                    });
                    Log.send(`[EVENT/INTERACTIONCREATE] Ошибка выполнения команды ${cmd.name}: ${err}`);
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