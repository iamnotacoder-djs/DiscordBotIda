'use strict';
const { Client, ApplicationCommandType, Message, BaseInteraction, AutocompleteInteraction } = require('discord.js');

class BaseCommand {
 
    // Основные параметры
    name = "commandname";
    usage = "Описание функционала команды";
    type = [];
    category = [];
    bot_permissions = [];
    
    // Дополнительные
    user_permissions = [];
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
    
	/**
	 * Создает экземпляр BaseCommand
	 */
    constructor() {
        // do nothing
    }

    
    /**
     * Вызов слушателя команды
     * @param  {Client} client Экземпляр Client
     * @param  {(Message|BaseInteraction)} command Поставляемый объект сообщения или интеракции
     */
    async exec(client, command) {
        command.user = command.author ?? command.user;
        Log.send(`[COMMANDS/${this.name.toUpperCase()}] Usage <@${command?.user?.id}> <#${command?.channel?.id}>`);
        this.execute(client, command);
    }

    /**
     * Вызов слушателя команды
     * @param  {Client} client Экземпляр Client
     * @param  {(Message|BaseInteraction)} command Поставляемый объект сообщения или интеракции
     */
    async execute(client, command) {
        // do nothing
    }

    /**
     * Слушатель компонентов
     * @param  {Client} client Экземпляр Client
     * @param  {BaseInteraction} interaction Поставляемый объект интеракции
     * @returns {boolean}
     */
    async componentListener(client, interaction) {
        // do nothing
        return false;
    }

    /**
     * Слушатель AutoComlete
     * @param  {Client} client Экземпляр Client
     * @param  {AutocompleteInteraction} interaction Поставляемый объект интеракции
     */
    async autocomplete(client, interaction) {
        // do nothing
    }

    /**
     * Предустановка таймаутов
     * @param  {Client} client Экземпляр Client
     * @returns {boolean}
     */
    async setupTimeouts(client) {
        // do nothing
        return false;
    }
    
}

module.exports = BaseCommand;