module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(client, oldState, newState) {
        await Log.init(client);
        // if (Config.debug) console.log(`[EVENT/VOICESTATEUPDATE] catched\nOld channel: ${oldState.channel}\nNew channel: ${newState.channel}`);
    }
}