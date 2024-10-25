const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");

module.exports = {
  name: "한강수온",
  description: "한강수온을 알려드려요!",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
      const rrr = Math.floor(Math.random() * (999 - (-999) + 1)) - 999;

      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(`한강수온을 알려드려요!`) 
        .setDescription(rrr + '°C')
      

      return interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
    }
  },
};
