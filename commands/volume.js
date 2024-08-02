const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const config = require("../config.js");

async function volume(client, interaction) {
    try {
        const player = client.riffy.players.get(interaction.guildId);
        const volume = interaction.options.getInteger('level');

        if (!player) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('재생중인 곡 없음');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (volume < 0 || volume > 100) {
            return interaction.reply({ content: '0 ~ 100 사이의 값으로 볼륨을 조정', ephemeral: true });
        }

        player.setVolume(volume);

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setDescription(`볼륨설정됨: **${volume}%**`);

        return interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error setting volume:', error);
        await interaction.reply({ content: '에러', ephemeral: true });
    }
}

module.exports = {
    name: "volume",
    description: "재생중인 음악의 음량설정",
    permissions: "0x0000000000000800",
    options: [{
        name: 'value',
        description: '음량설정(0~100)',
        type: ApplicationCommandOptionType.Integer,
        required: true
    }],
    run: volume
};
