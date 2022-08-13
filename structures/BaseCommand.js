'use strict';
const { ApplicationCommandType } = require('discord.js');

class BaseCommand {
 
    // Основные
    name = "commandname";
    usage = "Описание функционала команды";
    type = [];
    category = [];
    bot_permissions = [

    ];
    
    // Дополнительные
    user_permissions = [

    ];
    options = [];
    slash = { 
        name: this.name, 
        description: this.usage, 
        type: ApplicationCommandType.ChatInput, 
        options: this.options
    };
    context = {
        name: this.name, 
        type: ApplicationCommandType.Message
    };
    componentsNames = [];
    
    // Методы
    constructor() {
    }

    exec(client, command) {
        command.user = command.author ?? command.user;
        Log.send(`[COMMANDS/${this.name.toUpperCase()}] Usage <@${command?.user?.id}> <#${command?.channel?.id}>`);
        this.execute(client, command);
    }

    async execute(client, command) {
        // do nothing
    }

    componentListener(client, interaction) {
        // do nothing
        return false;
    }

    setupTimeouts(client) {
        // do nothing
        return false;
    }
    
}

module.exports = BaseCommand;