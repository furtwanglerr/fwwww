const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "support",
  description: "내가 좋아하는 음악",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {

      const supportServerLink = "https://youtu.be/Wcgd1oCbW4g?si=t8aSrsIxg5j5v18g";
      const githubLink = "https://youtu.be/Wcgd1oCbW4g?si=t8aSrsIxg5j5v18g";
      const replitLink = "https://youtu.be/Wcgd1oCbW4g?si=t8aSrsIxg5j5v18g";
      const youtubeLink = "https://youtu.be/Wcgd1oCbW4g?si=t8aSrsIxg5j5v18g";
        const embed = new EmbedBuilder()
            .setColor('#b300ff')
            .setAuthor({
              name: '모차르트 최고',
              iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1230824519220985896/6280-2.gif?ex=6638ae28&is=66375ca8&hm=13e4a1b91a95b2934a39de1876e66c11711c7b30ac1a91c2a158f2f2ed1c2fc6&', 
              url: 'https://youtu.be/Wcgd1oCbW4g?si=t8aSrsIxg5j5v18g'
          })
            .setDescription(`모차르트\n- 모차르트 - ${supportServerLink}\n\n모차르트\n- 모차르트 - ${githubLink}\n- 모차르트 - ${replitLink}\n- 차르트 - ${youtubeLink}`)
            .setImage('https://cdn.discordapp.com/attachments/1113800537402527903/1236803979996958740/11.png?ex=663956f7&is=66380577&hm=3b3c19a11adcb979517a133f2907f671305d23f1f5092cf7df043e6d5cab07bc&')
            .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (e) {
    console.error(e); 
  }
  },
};

