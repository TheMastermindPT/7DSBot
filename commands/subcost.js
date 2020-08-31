const Discord = require('discord.js');

module.exports = {
  name: 'subcost',
  description: 'Latest patch notes for 7DSGS',
  execute(message, args) {
    try {
      if (args[0] === 'c' || args[0] === 'uc' || args[0] === 'r') {
        let maxValue;
        let rarityCost;

        switch (args[1]) {
          case '3':
            maxValue = 3;
            break;
          case '6':
            maxValue = 6;
            break;
          case '4.5':
            maxValue = 4.5;
            break;
          default:
            message.channel.send('Insert a valid max value for the substat.');
            break;
        }
        if (!maxValue) return;

        if (args[0] === 'c') rarityCost = 5000;
        if (args[0] === 'uc') rarityCost = 7000;
        if (args[0] === 'r') rarityCost = 10000;

        const statCost = rarityCost / ((1 / 4) * (0.1 / maxValue));

        const gearCost = new Discord.MessageEmbed()
          .setColor('#821d01')
          .setTitle('How much does this substat cost?')
          .setThumbnail('https://imgur.com/Z49j86V.jpg')
          .addFields(
            { name: 'Cost:', value: statCost },
          )
          .setTimestamp();
        return message.channel.send(gearCost);
      }
      message.channel.send('Insert a valid rarity type for gear. Ex: c/uc/r');
    } catch (err) {
      console.error(err);
    }
  },
};
