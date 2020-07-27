const Discord = require('discord.js');

module.exports = {
  name: 'gear',
  description: 'Latest patch notes for 7DSGS',
  execute(message, args) {
    const capitalize = (s) => {
      if (typeof s !== 'string') return '';
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    if (args[0].toString().toLowerCase() === 'type') {
      message.channel.send(
        `
      List of arguments:
      !gear bracer [value]
      !gear neck [value]
      !gear belt [value]
      !gear ring [value]
      !gear ear [value]
      !gear rune [value]
        `,
      );
      return;
    }

    const type = args[0].toString().toLowerCase();
    const baseStat = parseInt(args[1]);

    const sendEmbed = (min, max) => {
      const percent = ((baseStat - min) * 100) / (max - min);
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#821d01')
        .setTitle('Should I awaken?')
        .setThumbnail('https://i.imgur.com/GkL1l0N.jpg?1')
        .addFields(
          { name: 'Type', value: capitalize(type) },
          { name: 'Base Stat', value: baseStat },
          { name: 'min', value: min },
          { name: 'max', value: max },
          { name: 'percent', value: `${percent.toFixed(1)}%` },
          { name: 'Should I awaken?', value: percent >= 90 ? 'Yes' : 'No' },
        )
        .setTimestamp();
      message.channel.send(exampleEmbed);
    };

    const gearRegex = /[\d]{0,4}/g;
    if (args[1] && gearRegex.test(args[2])) {
      switch (args[0]) {
        case 'bracer':
          min = 390;
          max = 520;
          if (baseStat >= min && baseStat <= max) {
            sendEmbed(min, max);
            return;
          }
          message.channel.send('Insert a value beetween 390 and 520!');
          break;
        case 'neck':
          min = 195;
          max = 260;
          if (baseStat >= min && baseStat <= max) {
            sendEmbed(min, max);
            return;
          }
          message.channel.send('Insert a value beetween 195 and 260!');
          break;
        case 'belt':
          min = 3900;
          max = 5200;
          if (baseStat >= min && baseStat <= max) {
            sendEmbed(min, max);
            return;
          }
          message.channel.send('Insert a value beetween 3900 and 5200!');
          break;
        case 'ring':
          min = 210;
          max = 280;
          if (baseStat >= min && baseStat <= max) {
            sendEmbed(min, max);
            return;
          }
          message.channel.send('Insert a value beetween 210 and 280!');
          break;
        case 'ear':
          min = 105;
          max = 140;
          if (baseStat >= min && baseStat <= max) {
            sendEmbed(min, max);
            return;
          }
          message.channel.send('Insert a value beetween 105 and 140!');
          break;
        case 'rune':
          min = 2100;
          max = 2800;
          if (baseStat >= min && baseStat <= max) {
            sendEmbed(min, max);
            return;
          }
          message.channel.send('Insert a value beetween 2100 and 2800!');
          break;
        default:
          message.channel.send('Insert a valid gear type. Ex: bracer, neck, belt, ring, ear, rune');
      }
    }
  },
};
