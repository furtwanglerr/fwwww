const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");

async function pause(client, interaction) {
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

        player.pause(true);

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setDescription('재생중인 곡을 멈춤');

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error processing pause command:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('에러');

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: "pause",
    description: "일시정지",
    permissions: "0x0000000000000800",
    options: [],
    run: pause
};
