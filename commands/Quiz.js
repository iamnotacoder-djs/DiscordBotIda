'use strict';
const   BaseCommand = require('../structures/BaseCommand'),
        { MessageActionRow, MessageEmbed, MessageButton } = require('discord.js');

class Quiz extends BaseCommand {
    
    name = "квест";
    usage = "Сыграть в сюжетный квест";
    type = [Config.CommandType.SLASH, Config.CommandType.CHAT];
	category = [Config.CommandCategory.GAME];
    bot_permissions = [
        'SEND_MESSAGES'
    ];
    slash = { 
        name: this.name, 
        description: this.usage, 
        type: `CHAT_INPUT`, 
        options: this.options,
        defaultPermission: true 
    };
    componentsNames = [`quizgame_...`];
    quiz = require("../assets/quiz.json");

    constructor() {
        super();
    }

    async execute(client, command) {
        if ([null, undefined].includes(client.db.get(`quiz`))) client.db.set(`quiz`, {});
        if ([null, undefined].includes(client.db.get(`quiz.spawns`))) client.db.set(`quiz.spawns`, {});
        if ([null, undefined].includes(client.db.get(`quiz.play`))) client.db.set(`quiz.play`, {});
        if ([null, undefined].includes(client.db.get(`quiz.stats`))) client.db.set(`quiz.stats`, {});
		if ([null, undefined].includes(client.db.get(`quiz.stats.q${this.quiz.id}`))) client.db.set(`quiz.stats.q${this.quiz.id}`, {
			liked: []
		});

        if (command.hasOwnProperty('isCommand')) command.deferUpdate();
		const m = await command.channel.send(this.getMMenuPage(client, ));
        if (command.author == undefined) command.author = command.user;
		client.db.set(`quiz.spawns.m${m.id}`, command.author.id);
    }

    componentListener(client, interaction) {
        if (interaction.isButton() && interaction.customId.includes(`quizgame_`)) {
            
            if (client.db.get(`quiz.spawns.m${interaction.message.id}`) != interaction.user.id) return interaction.reply(this.getMessagePermissionError(client.db.get(`quiz.spawns.m${interaction.message.id}`)));
            let date = new Date(); 
        
            if (interaction.customId.includes("quizgame_mmenu_back_")) {
                const page = interaction.customId.replace(`quizgame_mmenu_back_`, ``).trim();
                interaction.message.edit(this.getMMenuPage(client, page));
                interaction.deferUpdate();;
            }
            if (interaction.customId.includes("quizgame_mmenu_forw_")) {
                const page = interaction.customId.replace(`quizgame_mmenu_forw_`, ``).trim();
                interaction.message.edit(this.getMMenuPage(client, page));
                interaction.deferUpdate();;
            }
            if (interaction.customId.includes("quizgame_mmenu_play_")) {
                const page = interaction.customId.replace(`quizgame_mmenu_play_`, ``).trim();
                // TODO getting quiz by page index from db/array
                const q = this.quiz; 
                if ([null, undefined].includes(client.db.get(`quiz.play.u${interaction.user.id}.g${q.id}`))) client.db.set(`quiz.play.u${interaction.user.id}.g${q.id}`, {
                    logs: [],
                    save: -1
                });
                client.db.push(`quiz.play.u${interaction.user.id}.g${q.id}.logs`, `Начало игры | <t:${~~(date.getTime()/1000)}:R>`);
                interaction.message.edit(this.getQuizRoom(q, 0, interaction.user.id));
                interaction.deferUpdate();;
            }
            if (interaction.customId.includes("quizgame_game_home_")) {
                const quizId = interaction.customId.replace(`quizgame_game_home_`, ``).trim();
                // TODO getting quiz by page index from db/array
                const q = this.quiz; 
                client.db.push(`quiz.play.u${interaction.user.id}.g${q.id}.logs`, `Возврат на главную | <t:${~~(date.getTime()/1000)}:R>`);
                interaction.message.edit(this.getQuizRoom(q, 0, interaction.user.id));
                interaction.deferUpdate();;
            }
            if (interaction.customId.includes("quizgame_game_logs_")) {
                const quizId = interaction.customId.replace(`quizgame_game_logs_`, ``).trim();
                // TODO getting quiz by page index from db/array
                const q = this.quiz; 
                let logs = client.db.get(`quiz.play.u${interaction.user.id}.g${q.id}.logs`);
                logs.reverse();
                logs.splice(30, 10000);
                logs.reverse();
                client.db.set(`quiz.play.u${interaction.user.id}.g${q.id}.logs`, logs);
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Логи`)
                            .setDescription(`**Твоя активность**\n\n${logs.join("\n")}`)
                    ],
                    ephemeral: true
                });
            }
            if (interaction.customId.includes("quizgame_game_save_")) {
                const quizId = interaction.customId.replace(`quizgame_game_save_`, ``).trim().split(`_`)[0];
                // TODO getting quiz by page index from db/array
                const q = this.quiz; 
                const roomId = interaction.customId.replace(`quizgame_game_save_`, ``).trim().split(`_`)[1];
                client.db.set(`quiz.play.u${interaction.user.id}.g${q.id}.save`, roomId);
                client.db.push(`quiz.play.u${interaction.user.id}.g${q.id}.logs`, `Игра сохранена \`${q.rooms[roomId].text.substring(0, 20)}...\` | <t:${~~(date.getTime()/1000)}:R>`);
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Игра сохранена`)
                            .setDescription(`Игра сохранена \`${q.rooms[roomId].text.substring(0, 20)}...\` | <t:${~~(date.getTime()/1000)}:R>`)
                    ],
                    ephemeral: true
                });
            }
            if (interaction.customId.includes("quizgame_game_load_")) {
                const quizId = interaction.customId.replace(`quizgame_game_load_`, ``).trim();
                // TODO getting quiz by page index from db/array
                const q = this.quiz; 
                let save = client.db.get(`quiz.play.u${interaction.user.id}.g${q.id}.save`);
                if (save < 0 || save > q.rooms.length - 1) {
                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle(`Ошибка загрузки`)
                                .setDescription(`У тебя пока нет ни одного сохранения`)
                        ],
                        ephemeral: true
                    });
                    return true;
                }
                interaction.message.edit(this.getQuizRoom(q, save, interaction.user.id));
                client.db.push(`quiz.play.u${interaction.user.id}.g${q.id}.logs`, `Игра загружена \`${q.rooms[save].text.substring(0, 20)}...\` | <t:${~~(date.getTime()/1000)}:R>`);
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Игра загружена`)
                            .setDescription(`Игра загружена \`${q.rooms[save].text.substring(0, 20)}...\` | <t:${~~(date.getTime()/1000)}:R>`)
                    ],
                    ephemeral: true
                });
            }
            if (interaction.customId.includes("quizgame_game_answer_")) {
                const quizId = interaction.customId.replace(`quizgame_game_answer_`, ``).trim().split(`_`)[1];
                // TODO getting quiz by page index from db/array
                const q = this.quiz; 
                const answerId = interaction.customId.replace(`quizgame_game_answer_`, ``).trim().split(`_`)[0];
                const roomId = interaction.customId.replace(`quizgame_game_answer_`, ``).trim().split(`_`)[2];
                if (q.rooms[roomId].buttons[answerId].next_id != -1) {
                    interaction.message.edit(this.getQuizRoom(q, q.rooms[roomId].buttons[answerId].next_id, interaction.user.id));
                } else if (q.rooms[roomId].buttons[answerId].ending_id != -1) {
                    interaction.message.edit(this.getQuizEnding(q, q.rooms[roomId].buttons[answerId].ending_id, interaction.user.id));
                } else {
                    interaction.message.edit(this.getQuizRoom(q, 0, interaction.user.id));
                }
                interaction.deferUpdate();;
                client.db.push(`quiz.play.u${interaction.user.id}.g${q.id}.logs`, `Clicked at \`${interaction.component.label}\`[${answerId}] | <t:${~~(date.getTime()/1000)}:R>`);
            }
            if (interaction.customId.includes("quizgame_game_like_")) {
                const quizId = interaction.customId.replace(`quizgame_game_logs_`, ``).trim();
                // TODO getting quiz by page index from db/array
                const q = this.quiz; 
                
                let liked = client.db.get(`quiz.stats.q${q.id}.liked`);
                if ([null, undefined].includes(liked)) liked = [];
                if (!liked.includes(interaction.user.id)) liked.push(interaction.user.id);
                client.db.set(`quiz.stats.q${q.id}.liked`, liked);
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Квест лайкнут`)
                            .setDescription(`Спасибо за фидбек C:`)
                    ],
                    ephemeral: true
                });
            }
            return true;
        } 
    }

    getQuizRoom(q, page = 0, userId) {
        const room = q.rooms[page];
        let components = [
            new MessageActionRow() // Домой
                .addComponents(
                    new MessageButton()
                        .setEmoji(`🏠`)
                        .setStyle("SECONDARY")
                        .setCustomId(`quizgame_game_home_${q.id}`)
                ), 
            new MessageActionRow() // логи
                .addComponents(
                    new MessageButton()
                        .setEmoji(`⏱️`)
                        .setStyle("SECONDARY")
                        .setCustomId(`quizgame_game_logs_${q.id}`)
                ), 
            new MessageActionRow() // сохранить
                .addComponents(
                    new MessageButton()
                        .setEmoji(`💾`)
                        .setStyle("SECONDARY")
                        .setCustomId(`quizgame_game_save_${page}_${q.id}`)
                ), 
            new MessageActionRow() // загрузить
                .addComponents(
                    new MessageButton()
                        .setEmoji(`↩️`)
                        .setStyle("SECONDARY")
                        .setCustomId(`quizgame_game_load_${q.id}`)
                )
        ];
        for (let i = 0; i < room.buttons.length; i++) {
            components[i].addComponents(
                new MessageButton()
                    .setLabel(`${room.buttons[i].text}`)
                    .setStyle("PRIMARY")
                    .setCustomId(`quizgame_game_answer_${i}_${q.id}_${page}`)
            )
        }
        let embed = new MessageEmbed()
                    .setTitle(q.title)
                    .setDescription(`Играет: <@${userId}>\n\n\`\`\`${room.text}\`\`\``);
        if (room.image != undefined) {
            embed.setImage(room.image);
        }
        return {
            embeds: [ embed ],
            components: components
        };
    }
    
    getQuizEnding(q, page = 0, userId) {
        const ending = q.endings[page];
        let components = [
            new MessageActionRow() 
                .addComponents([
                    new MessageButton()
                        .setEmoji(`🏠`)
                        .setStyle("SECONDARY")
                        .setCustomId(`quizgame_game_home_${q.id}`),
                    new MessageButton()
                        .setEmoji(`⏱️`)
                        .setStyle("SECONDARY")
                        .setCustomId(`quizgame_game_logs_${q.id}`),
                    new MessageButton()
                        .setEmoji(`↩️`)
                        .setStyle("SECONDARY")
                        .setCustomId(`quizgame_game_load_${q.id}`),
                    new MessageButton()
                        .setEmoji(`❤️`)
                        .setStyle("SUCCESS")
                        .setCustomId(`quizgame_game_like_${q.id}`)
                ])
        ];
        return {
            embeds: [
                new MessageEmbed()
                    .setTitle(`[Финал] ${q.title}`)
                    .setDescription(`Playing: <@${userId}>\n\n\`\`\`${ending.text}\`\`\``)
            ],
            components: components
        };
    }
    
    getMMenuPage(client, page = 1) {
        // TODO getting quiz by page index from db/array
        const min = 1, max = 1;
        if (page < min) page = min;
        if (page > max) page = max;
        const q = this.quiz; 
        let liked = client.db.get(`quiz.stats.q${q.id}.liked`);
        return {
                embeds: [
                    new MessageEmbed()
                        .setTitle(q.title)
                        .setDescription(q.description)
                        .addField(`Комнаты`, `${q.rooms.length}`, true)
                        .addField(`Концовки`, `${q.endings.length}`, true)
                        .addField(`Лайки`, liked == undefined ? "0" : `${liked.length}`, true)
                        .addField(`Автор`, `[${q.author}](https://discordapp.com/users/${q.author_id}/)`)
                        .addField(`Создано`, `<t:${q.created_at}:R>`, true)
                ],
                components: [
                    new MessageActionRow()
                        .addComponents([
                            new MessageButton()
                                .setLabel((page <= min? ``: `[${parseInt(page)-1}] `) + "<")
                                .setDisabled(page <= min? true: false)
                                .setStyle("SECONDARY")
                                .setCustomId(`quizgame_mmenu_back_${page}`), // mmenu is main menu
                            new MessageButton()
                                .setLabel(`Играть`)
                                .setStyle("SUCCESS")
                                .setCustomId(`quizgame_mmenu_play_${page}`),
                            new MessageButton()
                                .setLabel(">" + (page >= max? ``: ` [${parseInt(page)+1}] `))
                                .setDisabled(page >= max? true: false)
                                .setStyle("SECONDARY")
                                .setCustomId(`quizgame_mmenu_forw_${page}`)
                        ])
                ]
            };
    }
    
    getMessagePermissionError(ownerId) {
        return {
            embeds: [
                new MessageEmbed()
                    .setTitle(`Ошибка доступа`)
                    .setDescription(`Эта игра была запущена другим пользователем: <@${ownerId}>`)
            ],
            ephemeral: true
        };
    }
}

module.exports = Quiz