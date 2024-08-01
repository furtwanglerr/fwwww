const { Riffy } = require("riffy");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const { queueNames, requesters } = require("./commands/play");
const { mewcard } = require("mewcard");
const config = require("./config.js");

function initializePlayer(client) {
    const nodes = config.nodes.map(node => ({
        name: node.name,
        host: node.host,
        port: node.port,
        password: node.password,
        secure: node.secure,
        reconnectTimeout: 5000,
        reconnectTries: Infinity
        
    }));

    client.riffy = new Riffy(client, nodes, {
        send: (payload) => {
            const guildId = payload.d.guild_id;
            if (!guildId) return;

            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        defaultSearchPlatform: "ytmsearch",
        restVersion: "v3"
    });

    let currentTrackMessageId = null;

    client.riffy.on("nodeConnect", node => {
        console.log(`Node "${node.name}" connected.`);
    });

    client.riffy.on("nodeError", (node, error) => {
        console.error(`Node "${node.name}" encountered an error: ${error.message}.`);
    });

    client.riffy.on("trackStart", async (player, track) => {
        const channel = client.channels.cache.get(player.textChannel);
        const trackUri = track.info.uri;
        const requester = requesters.get(trackUri);

        const card = new mewcard()
            .setName(track.info.title)
            .setAuthor(track.info.author)
            .setTheme(config.musicardTheme)
            .setBrightness(50)
            .setThumbnail(track.info.thumbnail)
            .setRequester(`${requester}`);

        const buffer = await card.build();
        const attachment = new AttachmentBuilder(buffer, { name: `musicard.png` });

        const embed = new EmbedBuilder()
            .setAuthor({
                name: '현재재생중',
                iconURL: config.MusicIcon
            })
            .setDescription('*/volume*으로 음량조절 */stop*으로 멈추기')
            .setImage('attachment://musicard.png')
            .setColor(config.embedColor);

        const actionRow1 = createActionRow1(false);
        const actionRow2 = createActionRow2(false);

        const message = await channel.send({ embeds: [embed], files: [attachment], components: [actionRow1, actionRow2] });
        currentTrackMessageId = message.id;

        const filter = i => [
            'loopToggle', 'skipTrack', 'disableLoop', 'showQueue', 'clearQueue',
            'stopTrack', 'pauseTrack', 'resumeTrack', 'volumeUp', 'volumeDown'
        ].includes(i.customId);

        const collector = message.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            await i.deferUpdate();

            const member = i.member;
            const voiceChannel = member.voice.channel;
            const playerChannel = player.voiceChannel;

            if (!voiceChannel || voiceChannel.id !== playerChannel) {
                const vcEmbed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setDescription('재생중인 음악을 설정하려면 음성채널에 참여해야함**');
                const sentMessage = await channel.send({ embeds: [vcEmbed] });
                setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
                return;
            }

            if (i.customId === 'loopToggle') {
                toggleLoop(player, channel);
            } else if (i.customId === 'skipTrack') {
                player.stop();
                const skipEmbed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setTitle("⏭️ **다음 곡 트는중..**")
                    .setTimestamp();

                const sentMessage = await channel.send({ embeds: [skipEmbed] });
                setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
            } else if (i.customId === 'disableLoop') {
                disableLoop(player, channel);
            } else if (i.customId === 'showQueue') {
                const queueMessage = queueNames.length > 0 ?
                    `🎵 **현재재생중:**\n${formatTrack(queueNames[0])}\n\n📜 **리스트:**\n${queueNames.slice(1).map((song, index) => `${index + 1}. ${formatTrack(song)}`).join('\n')}` :
                    "리스트가 비었음";
                const queueEmbed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setTitle("📜 **현재 리스트**")
                    .setDescription(queueMessage);

                const sentMessage = await channel.send({ embeds: [queueEmbed] });
                setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
            } else if (i.customId === 'clearQueue') {
                clearQueue(player);
                const clearQueueEmbed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setTitle("🗑️ **리스트가 비워짐**")
                    .setTimestamp();

                const sentMessage = await channel.send({ embeds: [clearQueueEmbed] });
                setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
            } else if (i.customId === 'stopTrack') {
                player.stop();
                player.destroy();
                const stopEmbed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setDescription('⏹️ **재생중인 음악을 끔**');

                const sentMessage = await channel.send({ embeds: [stopEmbed] });
                setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
            } else if (i.customId === 'pauseTrack') {
                if (player.paused) {
                    const alreadyPausedEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setDescription('⏸️ **재생중인 음악이 멈춤**');

                    const sentMessage = await channel.send({ embeds: [alreadyPausedEmbed] });
                    setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
                } else {
                    player.pause(true);
                    const pauseEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setDescription('⏸️ **재생중인 음악이 멈춤**');

                    const sentMessage = await channel.send({ embeds: [pauseEmbed] });
                    setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
                }
            } else if (i.customId === 'resumeTrack') {
                if (!player.paused) {
                    const alreadyResumedEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setDescription('▶️ **멈춘음악이 다시실행됨**');

                    const sentMessage = await channel.send({ embeds: [alreadyResumedEmbed] });
                    setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
                } else {
                    player.pause(false);
                    const resumeEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setDescription('▶️ **멈춘음악이 다시실행됨**');

                    const sentMessage = await channel.send({ embeds: [resumeEmbed] });
                    setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
                }
            } else if (i.customId === 'volumeUp') {
                if (player.volume < 100) {
                    const oldVolume = player.volume;
                    player.setVolume(Math.min(player.volume + 10, 100));
                    const volumeUpEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setDescription(`🔊 **음량이 ${player.volume - oldVolume}% 만큼 커짐  /  현재 음량: ${player.volume}**`);

                    const sentMessage = await channel.send({ embeds: [volumeUpEmbed] });
                    setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
                } else {
                    const maxVolumeEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setDescription('🔊 **음량이 이미 최대치임**');

                    const sentMessage = await channel.send({ embeds: [maxVolumeEmbed] });
                    setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
                }
            } else if (i.customId === 'volumeDown') {
                if (player.volume > 10) {
                    const oldVolume = player.volume;
                    player.setVolume(Math.max(player.volume - 10, 10));
                    const volumeDownEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setDescription(`🔉 **음량이 ${oldVolume - player.volume}% 만큼 작아짐  /  현재음량: ${player.volume}**`);

                    const sentMessage = await channel.send({ embeds: [volumeDownEmbed] });
                    setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
                } else {
                    const minVolumeEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setDescription('🔉 **음량이 이미 최저치임**');

                    const sentMessage = await channel.send({ embeds: [minVolumeEmbed] });
                    setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
                }
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} interactions.`);
        });
    });

    client.riffy.on("trackEnd", async (player, track) => {
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel || !currentTrackMessageId) return;

        const message = await channel.messages.fetch(currentTrackMessageId).catch(console.error);
        if (message) {
            const disabledRow1 = createActionRow1(true);
            const disabledRow2 = createActionRow2(true);

            await message.edit({ components: [disabledRow1, disabledRow2] }).catch(console.error);
        }

        currentTrackMessageId = null;
    });

    client.riffy.on("playerDisconnect", async (player) => {
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel || !currentTrackMessageId) return;

        const message = await channel.messages.fetch(currentTrackMessageId).catch(console.error);
        if (message) {
            const disabledRow1 = createActionRow1(true);
            const disabledRow2 = createActionRow2(true);

            await message.edit({ components: [disabledRow1, disabledRow2] }).catch(console.error);
        }

        currentTrackMessageId = null;
    });

    client.riffy.on("queueEnd", async (player) => {
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel || !currentTrackMessageId) return;

        const message = await channel.messages.fetch(currentTrackMessageId).catch(console.error);
        if (message) {
            const disabledRow1 = createActionRow1(true);
            const disabledRow2 = createActionRow2(true);

            await message.edit({ components: [disabledRow1, disabledRow2] }).catch(console.error);
        }

        const autoplay = false;

        if (autoplay) {
            player.autoplay(player);
        } else {
            player.destroy();
            const queueEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setDescription('*리스트에 추가된 음악들이 모두 끝남! 봇이 나가는중..**');

            await channel.send({ embeds: [queueEmbed] });
        }

        currentTrackMessageId = null;
    });

    async function toggleLoop(player, channel) {
        if (player.loop === "track") {
            player.setLoop("queue");
            const loopEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle("🔁 **리스트 반복이 켜짐**");
            const sentMessage = await channel.send({ embeds: [loopEmbed] });
            setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
        } else {
            player.setLoop("track");
            const loopEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle("🔁 **반복재생이 켜짐**");
            const sentMessage = await channel.send({ embeds: [loopEmbed] });
            setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
        }
    }

    async function disableLoop(player, channel) {
        player.setLoop("none");
        const loopEmbed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle("❌ **반복재생 비활성화됨**");
        const sentMessage = await channel.send({ embeds: [loopEmbed] });
        setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
    }

    function setLoop(player, loopType) {
        if (loopType === "track") {
            player.setLoop("track");
        } else if (loopType === "queue") {
            player.setLoop("queue");
        } else {
            player.setLoop("none");
        }
    }

    function clearQueue(player) {
        player.queue.clear();
        queueNames.length = 0;
    }

    function formatTrack(track) {
        const match = track.match(/\[(.*?) - (.*?)\]\((.*?)\)/);
        if (match) {
            const [, title, author, uri] = match;
            return `[${title} - ${author}](${uri})`;
        }
        return track;
    }

    function createActionRow1(disabled) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("반복재생 토글")
                    .setEmoji('🔁')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId("반복재생 비활성화")
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId("스킵")
                    .setEmoji('⏭️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId("리스트 보기")
                    .setEmoji('📜')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId("리스트 비우기")
                    .setEmoji('🗑️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled)
            );
    }

    function createActionRow2(disabled) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("일시정지")
                    .setEmoji('⏹️')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId("끄기")
                    .setEmoji('⏸️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId("재실행")
                    .setEmoji('▶️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId("볼륨업")
                    .setEmoji('🔊')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId("볼륨다운")
                    .setEmoji('🔉')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled)
            );
    }

    module.exports = { initializePlayer, setLoop, clearQueue, formatTrack };
}

module.exports = { initializePlayer };
    module.exports = { initializePlayer, setLoop, clearQueue, formatTrack };
}

module.exports = { initializePlayer };

