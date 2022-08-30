const { InteractionType, EmbedBuilder } = require("discord.js"),
      cooldown = new Map();

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(client, interaction) {
        await Log.init(client);

        // Кулдаун на команды
		if (![InteractionType.ApplicationCommandAutocomplete, InteractionType.ModalSubmit].includes(interaction?.type)) {
            const _cooldown = cooldown.get(interaction.user.id) ?? 0;
            if (Date.now() - _cooldown < 2000) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`На команды бота установлен кулдаун :/`)
                            .setColor(Config.embed_color)
                    ],
                    ephemeral: true
                });
            }
            cooldown.set(interaction.user.id, Date.now());
		}

        // Slash команды и Autocomplete
        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand() || interaction?.type == InteractionType.ApplicationCommandAutocomplete) {
            // Получаем команду их хандлера по имени
            const cmd = client.commands.get(interaction.commandName);
            // Проверяем соответствия
            if (cmd) {
                function _catch(e) {
                    // Сообщаем об ошибке
                    Log.error(`[EVENT/INTERACTIONCREATE] Ошибка выполнения команды ${cmd.name}: ${e}`);
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()                                
                                .setDescription(`Ошибка выполнения команды ${cmd.name}`)
                                .setColor(Config.embed_color)
                        ],
                        ephemeral: true
                    });
                }
                if (interaction?.type == InteractionType.ApplicationCommandAutocomplete) {
                    cmd.autocomplete(client, interaction).catch(_catch);
                } else {
                    cmd.exec(client, interaction).catch(_catch);
                }
            }
        } else {
			let found = false;
            for(let cmdkey of client.commands.keys()) {
                const cmd = client.commands.get(cmdkey);
				let regexName = false;
				cmd.componentsNames.forEach((name) => {
					if (name.includes('...') && interaction.customId.includes(name.replace('...', ''))) regexName = true;
				});
				if ((cmd.componentsNames.includes(interaction.customId) || regexName) && 
                    await cmd.componentListener(client, interaction).catch((e) => {
						if (!interaction.replied) interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setDescription(`Ошибка компонента ${interaction.customId}`)
									.setColor(Config.embed_color)
							],
							ephemeral: true
						});
						Log.error(`[EVENT/INTERACTIONCREATE] Ошибка компонента ${interaction.customId}: ${e}`);
                    })
                ) found = true;
            }

			if (!found && !interaction.replied) interaction.deferUpdate();
        }
    }
}
