const Discord = require('discord.js');
const db = require('../models/index');

module.exports = {
  name: 'friend',
  description: 'List of commands for 7DSPatchBot',
  execute(message, args) {
    try {
      const friendCodes = async () => {
        const regex = /^\d{9}$/;
        const membersCollection = await message.guild.members.fetch();
        const users = membersCollection.map((guild) => {
          const { user } = guild;
          if (!user.bot) {
            return user;
          }
          return [];
        });

        if (args[0] === 'set') {
          if (regex.test(args[1])) {
            const messageUser = users.find((member) => member.id === message.member.id);
            const friendCode = args[1];
            messageUser.friendCode = friendCode;

            const clovers = message.member.roles.cache.map((role) => {
              const { id } = role;
              let guild = '';

              switch (id) {
                case '734392418203598930':
                  guild = 'Friends of Guild';
                case '734123385940082698':
                  guild = 'CloverHS';
                  break;
                case '734123118402076672':
                  guild = 'Clover';
                  break;
                default:
                  break;
              }
              return guild;
            });

            const guild = clovers.find((value) => {
              if (value) {
                return value;
              }
              return '';
            });

            const name = messageUser.username.replace(/[^a-zA-Z0-9]/g, '');

            const [user, created] = await db.Member.findOrCreate({
              where: { discordId: message.member.id },
              defaults: {
                discordId: message.member.id,
                guild,
                name,
              },
            });

            if (!created) {
              db.Member.update(
                { friendCode, name, guild }, { where: { discordId: message.member.id } },
              );
            } else {
              console.log('New member');
            }

            return message.channel.send(`Congratulations \`${messageUser.username}\` from \`${guild}\`. Your friend code has been set!`);
          }
          message.channel.send('This is not a valid friend code!');
          return new Error('Insert a valid friend code!');
        }

        const discordId = /\d{18}/gi;
        // const usersArray = Object.values(users);

        if (args[0] === 'all') {
          const all = await db.Member.findAll({
            attributes: ['name', 'guild', 'friendCode'],
          });

          const cloverRegex = /(Clover)/gi;
          const cloverOnly = all.map((member) => {
            if (JSON.parse(member.guild)[0].match(cloverRegex)) {
              if (member.friendCode) {
                return member;
              }
            }
            return {};
          });

          const cloverFriendCodes = [];
          for (const member of cloverOnly) {
            if (member.friendCode) {
              cloverFriendCodes.push(member);
            }
          }

          const yourArray = cloverFriendCodes;
          const halfwayThrough = Math.ceil(cloverFriendCodes.length / 2);

          const sendEmbed = (arr) => {
            const exampleEmbed = new Discord.MessageEmbed()
              .setColor('#821d01')
              .setTitle('List of friend codes from Clover')
              .setTimestamp();

            for (const code of arr) {
              const { name, friendCode } = code;
              exampleEmbed.addFields(
                { name: `${name}`, value: friendCode, inline: true },
              );
            }
            message.channel.send(exampleEmbed);
          };

          if (cloverFriendCodes.length >= 25) {
            const cloverCodesFirst = cloverFriendCodes.slice(0, halfwayThrough);
            const cloverCodesLast = cloverFriendCodes.slice(halfwayThrough, yourArray.length);
            sendEmbed(cloverCodesFirst);
            sendEmbed(cloverCodesLast);
          } else {
            sendEmbed(cloverFriendCodes);
          }

          return '';
        }

        if (args[1] !== 'set') {
          if (discordId.test(args[0])) {
            console.log(typeof discordId);

            try {
              const found = await db.Member.findOne({ where: { discordId: args[0] } });
              if (found) {
                const { name, guild, friendCode } = found;
                return message.channel.send(`The friend code of \`${name}\` from \`${JSON.parse(guild)[0]}\` is \`${friendCode || 'not set'}\`.`);
              }
              return message.channel.send('That user does not exist.');
            } catch (err) {
              return console.error(err);
            }
          }
          return message.channel.send('This is not a valid username');
        }
        return true;
      };
      friendCodes();
    } catch (err) {
      return new Error('This function could not be executed!');
    }
    return 0;
  },
};
