const { EmbedBuilder } = require('discord.js')
const config = require("../config.js");

module.exports = {
  name: "ping",
  description: "봇의 핑 확인",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {


    try {

      const start = Date.now();
      interaction.reply("핑 확인중..").then(msg => {
        const end = Date.now();
        const embed = new EmbedBuilder()
          .setColor(config.embedColor)
          .setTitle(`Bot Latency`)
          .setDescription(`봇의 현재 핑 : ${end - start}ms`)
        return interaction.editReply({ embeds: [embed] }).catch(e => { });
      }).catch(err => { })

    } catch (e) {
    console.error(e); 
  }
  },
};

