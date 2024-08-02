const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");

async function resume(client, interaction) {
    try {
        const player = client.riffy.players.get(interaction.guildId);

        if (!player) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('재생중인 곡 없음');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        player.pause(false);

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setDescription('**음악이 다시실행됨**');

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error processing resume command:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('에러');

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: "다시시작",
    description: "멈춘음악 재실행",
    permissions: "0x0000000000000800",
    options: [],
    run: resume
};
