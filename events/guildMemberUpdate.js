module.exports = {
    name: 'guildMemberUpdate',
    once: false,
    async execute(client, oldMember, newMember) {
        await Log.init(client);
        // Personal Roles // Member теряет роль Nitro Booster
        if (newMember.guild.premiumSubscriptionCount > 0 && oldMember.roles.cache.some(r => r.id == newMember.guild.roles.premiumSubscriberRole.id) && !newMember.roles.cache.some(r => r.id == newMember.guild.roles.premiumSubscriberRole.id)) {
            let role_data = client.db.get(`support_roles.g_${newMember.guild.id}.u_${newMember.id}`);
            if (role_data != undefined && role_data.id != undefined) {
                client.commands.get('роль').deleteRole(client, newMember);
            }
        }
    }
}