'use strict';
const   { TextChannel } = require("discord.js")

class Logger {

    logs = new Map();

    constructor(client) {
        if (client) this.client = client;
    }

    init(client) {
        return new Promise((resolve, reject) => {
            this.client = client;
            try {
                this.client.channels.fetch("959096618395787344")
                    .then((channel) => {
                        this.channel = channel;
                        resolve();
                    })
                    .catch((e) => {
                        console.error(e);
                        resolve(e);
                    });
            } catch (e) {
                console.error(e);
                resolve(e);
            }
        });
    }

    send(message) {
        if (Config.debug || !this.channel) console.log(message);
        if (this.channel) {
            let key = `[]`;
            if (message.match(/(\[)([a-z].*)(\])/ig)) key = message.match(/(\[)([a-z].*)(\])/ig)[0];
            if (!this.logs.has(message)) {
                this.channel.send(`${message}`)
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
                    this.channel.send(`${message}`)
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

    error(message) {
        console.error(message);
        if (this.channel instanceof TextChannel) this.channel.send(`@everyone\n${message}`).catch(console.error);
    }

}

module.exports = Logger;