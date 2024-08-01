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
                name: '음악재생중',
                iconURL: config.MusicIcon
            })
            .setDescription('*/volume을 사용하여 볼륨조정 /stop으로 멈추기*')
            .setImage('attachment://musicard.png')
            .setColor(config.embedColor);
    }

    module.exports = { initializePlayer, setLoop, clearQueue, formatTrack };
}

module.exports = { initializePlayer };

