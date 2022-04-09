module.exports = {
    name: 'modalSubmit',
    once: false,
    async execute(client, interaction) {
        await Log.init(client);

        let found = false;
        client.commands.forEach((cmd) => {
            let regexName = false;
            cmd.componentsNames.forEach((name) => {
                if (name.includes('...') && interaction.customId.includes(name.replace('...', ''))) regexName = true;
            });
            if ((cmd.componentsNames.includes(interaction.customId) || regexName) && cmd.modalListener(client, interaction)) return found = true;
        });
		
		if (!found) {
			await interaction.deferReply({ ephemeral: true })
			interaction.followUp({ content: `Done`, ephemeral: true});
        };
    }
}