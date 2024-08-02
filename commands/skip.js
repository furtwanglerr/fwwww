const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");

async function skip(client, interaction) {
    try {
        const player = client.riffy.players.get(interaction.guildId);

        if (!player) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('에러');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        player.stop();

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setDescription('**다음 곡 재생중..**');

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error processing skip command:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('에러');

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: "스킵",
    description: "현재 재생중인 곡을 스킵",
    permissions: "0x0000000000000800",
    options: [],
    run: skip
};
