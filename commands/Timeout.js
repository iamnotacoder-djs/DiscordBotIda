'use strict';
const BaseCommand = require('../structures/BaseCommand');

class Timeout extends BaseCommand {
    
    name = "замутить";
    usage = "Замутить пользователя (timeout)";
    type = [Config.CommandType.CHAT, Config.CommandType.SLASH];
	category = [Config.CommandCategory.ADMIN];
    bot_permissions = [
        'MODERATE_MEMBERS'
    ];
    options = [
        {
            name: "user",
            description: "Пользователь для таймаута",
            type: "USER",
            required: true
        }, 
        {
            name: "time",
            description: "Время в минутах",
            type: "INTEGER"
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
        let time = 1000 * 60 * 60; // 1 час
        if (command.content != undefined) {
            command.mentions.users.forEach((u) => {
                if (u.id != user.id) user = u;
            });
            let res = command.content.match(/( )([0-9].*)( )/gm);
            if (res?.length >= 1) time = 1000 * 60 * parseInt(res[0].trim());
        } else {
            user = command.options.getUser(`user`);
            let res = command.options.getInteger(`time`);
            if (res != null) time = 1000 * 60 * res;
        }
        if (time < 1000 * 60) time = 0;
        if (time > 1000 * 60 * 60 * 24 * 7) time = 1000 * 60 * 60 * 24 * 7;

        const member = await command.guild.members.fetch(user.id);
        const setted_roles = client.db.get(`guilds.g${command.guild.id}.admins`) ?? [];
        let moderatable = true;
        if (member.permissions.has('ADMINISTRATOR') || (setted_roles.length != 0 && member.roles.cache.some(role => setted_roles.includes(role.id)))) {
            moderatable = false;
        }
        if (user.bot || !member.moderatable || !moderatable || [command.user.id, client.user.id].includes(user.id) || command.member.roles.highest.position <= member.roles.highest.position) return command.reply({
            content: `Пользователь <@${user.id}> не доступен для таймаута.`,
            ephemeral: true
        });
        if (time == 0) {
            member.timeout(null, `${user.tag} размучен (таймаут) по админ-команде пользователем ${command.user.tag}`);
            command.reply({
                content: `> ${user.tag} (<@${user.id}>) размучен (таймаут) по админ-команде пользователем ${command.user.tag} (<@${command.user.id}>).\n\nДанное сообщение продублировано в **Аудит сервера**`,
                ephemeral: true
            });
        } else {
            member.timeout(time, `${user.tag} замучен (таймаут) на ${time} минут по админ-команде пользователем ${command.user.tag}`);
            command.reply({
                content: `> ${user.tag} (<@${user.id}>) замучен (таймаут) на ${time} минут по админ-команде пользователем ${command.user.tag} (<@${command.user.id}>).\n\nДанное сообщение продублировано в **Аудит сервера**`,
                ephemeral: true
            });
        }
    }

}

module.exports = Timeout