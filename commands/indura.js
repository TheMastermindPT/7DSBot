const Discord = require('discord.js');
const db = require('../models/index');

module.exports = {
  name: 'indura',
  description: 'commands for induras roles',
  execute(message, args) {
    try {
      if (args[0] === 'set') {
        const messageAuthorHasInduraRole = message.member.roles.cache.find((role) => role.id === '734127338576412705');
        const url = args[1];
        const { id } = message.author;

        if (!messageAuthorHasInduraRole) {
          db.Member.update({ indura: false }, { where: { discordId: id } });
          return message.channel.send('`You are not an Indura. Get better and try next time.`');
        }

        const isUrl = /^(http:\/\/|https:\/\/)/i;
        if (!isUrl.test(args[1])) return;

        db.Member.findOne({ where: { discordId: id } }).then((found) => {
          if (!found) return;
          const { idMember } = found;
          found.update({ indura: true }, { where: { discordId: id } });

          db.Image.findOrCreate({
            where: { membersIdMember: idMember },
            defaults: {
              url,
              membersIdMember: idMember,
            },
          }).then((image, created) => {
            if (!created) {
              db.Image.update({ url }, { where: { membersIdMember: idMember } });
              return message.channel.send('Hey `Indura`. Your picture has been set.');
            }
          }).catch((err) => console.error(err));
        }).catch((err) => console.error(err));
      }
    } catch (err) {
      console.error(err);
    }
    return '';
  },
};
