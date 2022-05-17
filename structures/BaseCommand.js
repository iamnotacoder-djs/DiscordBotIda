'use strict';

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
    options = [
        // {
        //     name: "def",
        //     description: "дефолтная опция",
        //     type: "STRING"
        // }
    ];
    slash = { 
        name: this.name, 
        description: this.usage, 
        type: `CHAT_INPUT`, 
        options: this.options, 
        defaultPermission: false 
    };
    context = {
        name: this.name, 
        type: `MESSAGE`
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