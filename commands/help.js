const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");

module.exports = {
  name: "도움말",
  description: "봇 사용하는법",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
      const botName = client.user.username; 

      const helpDescription = `
\`\`\`css
사용 가능한 명령어:

/재생 [음악제목]
/정지
/스킵
/일시정지
/다시시작
/음량
/핑
/재생정보
\`\`\`
      `;

      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(`${botName} 도움말`)
        .setThumbnail(client.user.displayAvatarURL()) 
        .setDescription(helpDescription)
        .setFooter({ text: `음악봇`, iconURL: client.user.displayAvatarURL() }) 
      

      return interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
    }
  },
};


