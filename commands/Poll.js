'use strict';
const   BaseCommand = require('../structures/BaseCommand'),
        { MessageActionRow, MessageEmbed, MessageButton } = require('discord.js');

class Poll extends BaseCommand {
    
    name = "голосование";
    usage = "Создать голосование";
    type = [Config.CommandType.SLASH];
	category = [Config.CommandCategory.FUN];
    bot_permissions = [
        'SEND_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_THREADS'
    ];
    options = [
        {
            name: "time",
            description: "Время на голосование в минутах",
            type: "INTEGER",
            required: true
        }, {
            name: "question",
            description: "Вопрос",
            type: "STRING",
            required: true
        }, {
            name: "answer1",
            description: "Ответ 1",
            type: "STRING",
            required: true
        }, {
            name: "answer2",
            description: "Ответ 2",
            type: "STRING",
            required: true
        }, {
            name: "answer3",
            description: "Ответ 3",
            type: "STRING"
        }, {
            name: "answer4",
            description: "Ответ 4",
            type: "STRING"
        }, {
            name: "answer5",
            description: "Ответ 5",
            type: "STRING"
        }
    ];
    slash = { 
        name: this.name, 
        description: this.usage, 
        type: `CHAT_INPUT`, 
        options: this.options, 
        defaultPermission: true 
    };
    componentsNames = [`poll_answer1`, `poll_answer2`, `poll_answer3`, `poll_answer4`, `poll_answer5`];

    constructor() {
        super();
    }

    async execute(client, command) {
        let time = command.options.getInteger("time"); time = time < 1 ? 1 : time > 60 * 24 * 7 ? 60 * 24 * 7 : time;
        let poll = {
            question: command.options.getString("question"),
            answer1: command.options.getString("answer1"),
            answer1_votes: 0,
            answer2: command.options.getString("answer2"),
            answer2_votes: 0,
            answer3: command.options.getString("answer3") ?? undefined, // if command.options.getString("answer3") == null {command.options.getString("answer3") = undefined}
            answer3_votes: 0,
            answer4: command.options.getString("answer4") ?? undefined,
            answer4_votes: 0,
            answer5: command.options.getString("answer5") ?? undefined,
            answer5_votes: 0,
            members: [],
            startDate: command.createdTimestamp,
            endDate: (command.createdTimestamp + 1000 * 60 * time)
        };
        let components = [];
        for (let i = 1; i <= 5; i++) {
            if (poll[`answer${i}`] != undefined) {
                components.push(
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setLabel(`${poll[`answer${i}`]} [0]`)
                                .setStyle("PRIMARY")
                                .setCustomId(`poll_answer${i}`)
                        )
                );
            }
        }
        const channel = await command.channel;
        const message = await channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(poll.question)
                    .setDescription(`Дата окончания голосования: <t:${~~(poll.endDate/1000)}:F>`) // 0.5 ; ~~0.5 = 0;
                    .setColor(Config.embed_color)
                    .setAuthor({
                        name: command.member.displayName, 
                        iconURL: command.member.displayAvatarURL(),
                        url: `https://discordapp.com/users/${command.user.id}/`
                    })
            ],
            components: components
        });
        client.db.set(`polls.p${message.id}`, poll);
        command.reply({
            content: `Голосование было создано:\n${message.url}`,
            ephemeral: true
        });
        // Create thread
        if (command.inGuild()) message.startThread( { name: `[Обсуждение] ${poll.question.substring(0, 20)}` } )
            .then(async (thread) => {
                thread.send(`${command.user}`).then((m) => m.delete());
                thread.send(`Голосовать здесь:\n${message.url}`)
            });
    }

    componentListener(client, interaction) {
		if (interaction.isButton()) {
			if (interaction.customId.match(/(poll_answer)([12345])/i)) {
                const db = client.db.get(`polls.p${interaction.message.id}`);
                if (interaction.createdTimestamp > db.endDate) {
                    let higest = this.indexOfMax([db[`answer1_votes`], db[`answer2_votes`], db[`answer3_votes`], db[`answer4_votes`], db[`answer5_votes`]]); 
                    let components = [];
                    for (let i = 1; i <= 5; i++) {
                        if (db[`answer${i}`] != undefined) {
                            components.push(
                                new MessageActionRow()
                                    .addComponents(
                                        new MessageButton()
                                            .setLabel(`${db[`answer${i}`]} [${db[`answer${i}_votes`]}]`) 
                                            .setStyle(higest + 1 == i ? "SUCCESS": "DANGER")
                                            .setDisabled(true)
                                            .setCustomId(`poll_answer${i}`)
                                    )
                            );
                        }
                    }
                    interaction.message.edit({
                        embeds: interaction.message.embeds,
                        components: components
                    });
                    interaction.reply({
                        content: `🚫 Голосование окончено!`,
                        ephemeral: true
                    });
                    return true;
                }
                if (db.members.includes(interaction.user.id)) {
                    interaction.reply({
                        content: `🚫 Ты уже принял участие в голосовании!`,
                        ephemeral: true
                    });
                    return true;
                }
                client.db.push(`polls.p${interaction.message.id}.members`, interaction.user.id);
                let components = [];
                for (let i = 1; i <= 5; i++) {
                    if (db[`answer${i}`] != undefined) {
                        components.push(
                            new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setLabel(`${db[`answer${i}`]} [${db[`answer${i}_votes`] + (interaction.customId == `poll_answer${i}` ? 1 : 0)}]`) 
                                        .setStyle("PRIMARY")
                                        .setCustomId(`poll_answer${i}`)
                                )
                        );
                        if (interaction.customId == `poll_answer${i}`) {
                            client.db.add(`polls.p${interaction.message.id}.answer${i}_votes`, 1);
                        }
                    }
                }
                interaction.message.edit({
                    embeds: interaction.message.embeds,
                    components: components
                });
                interaction.reply({
                    content: `Your choice is saved!`,
                    ephemeral: true
                });
				return true;
			}
		}
    }
	
	indexOfMax(arr) {
		if (arr.length === 0) {
			return -1;
		}

		var max = arr[0];
		var maxIndex = 0;

		for (var i = 1; i < arr.length; i++) {
			if (arr[i] > max) {
				maxIndex = i;
				max = arr[i];
			}
		}

		return maxIndex;
	}
}

module.exports = Poll
