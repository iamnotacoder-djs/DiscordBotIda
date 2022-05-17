'use strict';
const BaseCommand = require('../structures/BaseCommand');

class Kick extends BaseCommand {
    
    name = "выгнать";
    usage = "Выгнать пользователя (kick)";
    type = [Config.CommandType.CHAT, Config.CommandType.SLASH];
	category = [Config.CommandCategory.ADMIN];
    bot_permissions = [
        'KICK_MEMBERS'
    ];
    options = [
        {
            name: "user",
            description: "Пользователь для кика",
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
        let kickable = true;
        if (member.permissions.has('ADMINISTRATOR') || (setted_roles.length != 0 && member.roles.cache.some(role => setted_roles.includes(role.id)))) {
            kickable = false;
        }
        if (user.bot || !member.kickable || !kickable || [command.user.id, client.user.id].includes(user.id) || command.member.roles.highest.position <= member.roles.highest.position) return command.reply({
            content: `Пользователь <@${user.id}> не доступен для кика.`,
            ephemeral: true
        });
        member.kick(`${user.tag} кикнут по админ-команде пользователем ${command.user.tag}`);
        command.reply({
            content: `> ${user.tag} (<@${user.id}>) кикнут по админ-команде пользователем ${command.user.tag} (<@${command.user.id}>).\n\nДанное сообщение продублировано в **Аудит сервера**`,
            ephemeral: true
        });
    }

}

module.exports = Kick