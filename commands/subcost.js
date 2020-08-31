const Discord = require('discord.js');

module.exports = {
  name: 'subcost',
  description: 'Latest patch notes for 7DSGS',
  execute(message, args) {
    try {
      if (args[0] === 'c' || args[0] === 'uc' || args[0] === 'r') {
        let rarityCost;

        if (args[0] === 'c') rarityCost = 5000;
        if (args[0] === 'uc') rarityCost = 7000;
        if (args[0] === 'r') rarityCost = 10000;

        const statCost3 = rarityCost / ((1 / 4) * (0.1 / 3));
        const statCost45 = rarityCost / ((1 / 4) * (0.1 / 4.5));
        const statCost6 = rarityCost / ((1 / 4) * (0.1 / 6));

        const gearCost = new Discord.MessageEmbed()
          .setColor('#821d01')
          .setTitle('**Average cost to get max roll**')
          .setThumbnail('https://imgur.com/Z49j86V.jpg')
          .addFields(
            { name: '*Atk/Def/Hp:*', value: `*${statCost3}*` },
            { name: '*C.chance/ C.Res /Lifesteal:*', value: `*${statCost45}*` },
            { name: '*Pierce/ Res/ Cdmg/ C.Def / Recov.R / Regen.R: *', value: `*${statCost6}*` },
          )
          .setTimestamp();
        return message.channel.send(gearCost);
      }
      return message.channel.send('Insert a valid rarity type for gear. Ex: c/uc/r');
    } catch (err) {
      console.error(err);
    }
    return 0;
  },
};
