const { Guild } = require('discord.js');

const whitelist = ['586649671460585472', '251509011357106176'];

module.exports = {
  name: 'delete',
  description: 'Deletes messages from the channel from to 2 up to 100.',
  execute(message, args) {
    const amount = parseInt(args[0]) + 1;
    if (message.guild.ownerID === whitelist[1] || message.guild.me === whitelist[1]) {
      if (isNaN(amount)) {
        return message.reply('that doesn\'t seem to be a valid number.');
      } if (amount <= 1 || amount > 100) {
        return message.reply('you need to input a number between 2 and 100.');
      } if (amount >= 2 && amount <= 100) {
        return message.channel.bulkDelete(amount, true).catch((err) => {
          console.error(err);
          message.channel.send('There was an error trying to delete messages in this channel!');
        });
      }
    }
  },
};
