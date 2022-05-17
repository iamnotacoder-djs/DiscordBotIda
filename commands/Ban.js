'use strict';
const BaseCommand = require('../structures/BaseCommand');

class Ban extends BaseCommand {
    
    name = "бан";
    usage = "Забанить пользователя";
    type = [Config.CommandType.CHAT, Config.CommandType.SLASH];
	category = [Config.CommandCategory.ADMIN];
    bot_permissions = [
        'BAN_MEMBERS'
    ];
    options = [
        {
            name: "user",
            description: "Пользователь для бана",
            type: "USER",
            required: true
        }
    ];
    slash = { 
        name: this.name, 
        description: this.usage, 
        type: `CHAT_INPUT`, 
        options: this.options, 
        defaultPermission: true 
    };

    constructor() {
        super();
    }

    async execute(client, command) {
        let user = client.user;
        if (command.content != undefined) {
            command.mentions.users.forEach((u) => {
                if (u.id != user.id) user = u;
            });
        } else {
            user = command.options.getUser(`user`);
        }
        const member = await command.guild.members.fetch(user.id);
        const setted_roles = client.db.get(`guilds.g${command.guild.id}.admins`) ?? [];
        let bannable = true;
        if (member.permissions.has('ADMINISTRATOR') || (setted_roles.length != 0 && member.roles.cache.some(role => setted_roles.includes(role.id)))) {
            bannable = false;
        }
        if (user.bot || !member.bannable || !bannable || [command.user.id, client.user.id].includes(user.id) || command.member.roles.highest.position <= member.roles.highest.position) return command.reply({
            content: `Пользователь <@${user.id}> не доступен для бана.`,
            ephemeral: true
        });
        member.ban({ days: 0, reason: `${user.tag} забанен по админ-команде пользователем ${command.user.tag}` });
        command.reply({
            content: `> ${user.tag} (<@${user.id}>) забанен по админ-команде пользователем ${command.user.tag} (<@${command.user.id}>).\n\nДанное сообщение продублировано в **Аудит сервера**`,
            ephemeral: true
        });
    }

}

module.exports = Ban