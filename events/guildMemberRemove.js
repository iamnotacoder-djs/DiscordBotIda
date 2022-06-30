module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(client, member) {
        await Log.init(client);

        // Personal Roles 
        let role_data = client.db.get(`support_roles.g_${member.guild.id}.u_${member.id}`);
        if (role_data != undefined && role_data.id != undefined) {
            client.commands.get('роль').deleteRole(client, member);
        }
    }
}