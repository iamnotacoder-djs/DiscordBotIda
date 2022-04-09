module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(client, guild) {
        await Log.init(client);
        guild.me.setNickname(Config.bot_name)
            .catch(() => {
                // do nothing
            });
    }
}