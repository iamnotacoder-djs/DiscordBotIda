module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(client, guild) {
        await Log.init(client);
    }
}