const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");

module.exports = {
  name: "help",
  description: "봇정보",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
      const botName = client.user.username; 

      const helpDescription = `
\`\`\`css
사용 가능한 명령어:

/play    - 음악재생
/pause   - 음악 일시정지
/resume  - 음악 다시재생
/skip    - 음악스킵(다음음악재생)
/stop    - 음악끄기
/np      - 현재재생중인 음악정보
/volume  - 볼륨조정
/ping    - 봇의 핑확인
\`\`\`
      `;

      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(`${botName} 도움말`)
        .setThumbnail(client.user.displayAvatarURL()) 
        .setDescription(helpDescription)
        .setFooter({ text: `신재봇`, iconURL: client.user.displayAvatarURL() }) 
      

      return interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
    }
  },
};


