module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(client, guild) {
        await Log.init(client);
		client.db.set(guild.id, Config.Locales[guild.preferredLocale] ?? 0);
    }
}