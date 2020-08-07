// Server Manager = 734092416092471386
// Admins = 662888342555197451

module.exports = {
  name: 'delete',
  description: 'Deletes messages from the channel from to 2 up to 100.',
  execute(message, args) {
    const amount = parseInt(args[0], 10) + 1;
    if (message.member.roles.cache.has('662888342555197451') || message.member.roles.cache.has('734092416092471386')) {
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
    return false;
  },
};
