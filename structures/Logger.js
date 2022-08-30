'use strict';
const   { TextChannel, Client } = require("discord.js")

class Logger {

    logs = new Map();

	/**
	 * Создает экземпляр Logger
	 * @param  {Client} Экземпляр Client для доступа к каналу логов
	 */
    constructor(client) {
        if (client) this.client = client;
    }

	/**
	 * Обновление Client, если он еще не был указан
	 * @param  {Client} Экземпляр Client для доступа к каналу логов
	 */
    async init(client) {
        this.client = client;
        this.channel = await this.client.channels.fetch(Config.controller_logs).catch(() => {});
    }

    /**
     * Вывод текста в консоль(debug?) и канал для логов
     * @param  {string} message Текст сообщения
     */
    send(message) {
        if (Config.debug || !this.channel) console.log(message);
        if (this.channel) {
            let key = `[]`;
            if (message.match(/(\[)([a-z].*)(\])/ig)) key = message.match(/(\[)([a-z].*)(\])/ig)[0];
            if (!this.logs.has(message)) {
                this.channel.send({
                    content: `${message}`,
                    allowedMentions: {
                        users: []
                    }
                })
                    .then((m) => {
                        this.logs.set(message, {
                            t: Date.now(),
                            m: m.id, 
                            c: 1
                        });
                    })
                    .catch(console.error);
            } else {
                if (Date.now() - this.logs.get(message).t > 1000 * 60 * 60) {
                    this.channel.send({
                        content: `${message}`,
                        allowedMentions: {
                            users: []
                        }
                    })
                        .then((m) => {
                            this.logs.set(message, {
                                t: Date.now(),
                                m: m.id, 
                                c: 1
                            });
                        })
                        .catch(console.error);
                } else {
                    this.channel.messages.fetch(this.logs.get(message).m)
                        .then((msg) => {
                            this.logs.set(message, {
                                t: Date.now(),
                                m: msg.id, 
                                c: this.logs.get(message).c + 1
                            });
                            msg.edit({
                                content: `${message} (${this.logs.get(message).c})`
                            })
                        })
                        .catch(console.error);
                }
            }
        }
    }

    /**
     * Вывод ошибки в консоль и канал для логов
     * @param  {string} message Текст сообщения
     */
    error(message) {
        console.error(message);
        let channel = this?.channel;
        if (channel instanceof TextChannel) {
            channel.send(`@everyone\n${message}`).catch(console.error);
        }
    }

}

module.exports = Logger;