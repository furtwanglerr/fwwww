const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const config = require("../config.js");

const queueNames = [];
const requesters = new Map(); 

async function play(client, interaction) {
    try {
        const query = interaction.options.getString('name');

        if (!interaction.member.voice.channelId) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('음성채널에 참여해야함')
                .setDescription('명령어를 실행하려면 음성채널에 참여해야함');

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const player = client.riffy.createConnection({
            guildId: interaction.guildId,
            voiceChannel: interaction.member.voice.channelId,
            textChannel: interaction.channelId,
            deaf: true
        });

        await interaction.deferReply();

        const resolve = await client.riffy.resolve({ query: query, requester: interaction.user.username });
        //console.log('Resolve response:', resolve);

        if (!resolve || typeof resolve !== 'object') {
            throw new TypeError('Resolve response is not an object');
        }

        const { loadType, tracks, playlistInfo } = resolve;

        if (!Array.isArray(tracks)) {
            console.error('Expected tracks to be an array:', tracks);
            throw new TypeError('Expected tracks to be an array');
        }

        if (loadType === 'PLAYLIST_LOADED') {
            for (const track of tracks) {
                track.info.requester = interaction.user.username; 
                player.queue.add(track);
                queueNames.push(`[${track.info.title} - ${track.info.author}](${track.info.uri})`);
                requesters.set(track.info.uri, interaction.user.username); 
            }

            if (!player.playing && !player.paused) player.play();

        } else if (loadType === 'SEARCH_RESULT' || loadType === 'TRACK_LOADED') {
            const track = tracks.shift();
            track.info.requester = interaction.user.username; 

            player.queue.add(track);
            queueNames.push(`[${track.info.title} - ${track.info.author}](${track.info.uri})`);
            requesters.set(track.info.uri, interaction.user.username); 

            if (!player.playing && !player.paused) player.play();
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('Error')
                .setDescription('결과없음');

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const embeds = [
            new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({
                    name: 'Request Update',
                    iconURL: config.CheckmarkIcon,
                    url: config.SupportServer
                })
                .setDescription('**음악이 성공적으로 재생됨!**\n**버튼을 사용하여 재생설정**')
                 .setFooter({ text: '음악 재생중!'}),

            new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({
                    name: 'Request Update',
                    iconURL: config.CheckmarkIcon,
                    url: config.SupportServer
                })
                .setDescription('**음악이 성공적으로 재생됨!**\n**버튼을 사용하여 재생설정**')
                 .setFooter({ text: '음악 재생중!'}),

            new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({
                    name: 'Request Update',
                    iconURL: config.CheckmarkIcon,
                    url: config.SupportServer
                })
                .setDescription('**음악이 성공적으로 재생됨!**\n**버튼을 사용하여 재생설정**')
                .setFooter({ text: '음악 재생중!'})
        ];

        const randomIndex = Math.floor(Math.random() * embeds.length);
        await interaction.followUp({ embeds: [embeds[randomIndex]] });

    } catch (error) {
        console.error('에러:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('에러');

        await interaction.editReply({ embeds: [errorEmbed] });
    }
}

module.exports = {
    name: "play",
    description: "링크나 제목으로 음악재생",
    permissions: "0x0000000000000800",
    options: [{
        name: 'name',
        description: '음악의 제목이나 링크를 입력하세요',
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    run: play,
    queueNames: queueNames,
    requesters: requesters 
};



