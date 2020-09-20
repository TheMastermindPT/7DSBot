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
        const users = await db.Member.findAll();

        // FRIENDCODES CHANNEL
        if (message.channel.id === '663213318957432887' || message.channel.id === '734182168213061723') {
          if (args[0] === 'set') {
            if (regex.test(args[1])) {
              const messageUser = users.find((member) => member.discordId === message.member.id);
              if(!messageUser) throw new Error('No guild user in the database');
              console.log(messageUser);
              const sliced = new RegExp(/^\d{9}$/, 'i');

              const friendCode = sliced.test(args[1]);
              messageUser.friendCode = friendCode;

              if(friendCode) {
                await db.Member.update({ friendCode: args[1] }, {
                  where: {
                    discordId: messageUser.discordId,
                  },
                });
              }
          
              return message.channel.send(`Congratulations \`${messageUser.name}\` from \`${JSON.parse(messageUser.guild)[0]}\`. Your friend code has been set!`);
            }
            return message.channel.send('This is not a valid friend code!');
          }
        }

        const discordId = /\d{18}/gi;

        // LIST ALL FRIEND CODES IN A RICH EMBED
        if (args[0] === 'all') {
          try {
            const all = await db.Member.findAll({
              attributes: ['name', 'guild', 'friendCode'],
            });

            const cloverRegex = /(Clover)/gi;
            const cloverOnly = all.map((member) => {
              const guildJSON = JSON.parse(member.guild)[0];
              if (guildJSON && guildJSON.match(cloverRegex)) {
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
          } catch (err) {
            return console.error(err);
          }
          return '';
        }

        // FIND USER FRIENDCODE BY DISCORDID
        if (discordId.test(args[0])) {
          try {
            let sliced = new RegExp(/\d{18}/, 'i');
            // issue with mobile users
            sliced = args[0].match(sliced);
            const found = await db.Member.findOne({ where: { discordId: sliced } });

            if (found) {
              const { name, guild, friendCode } = found;
              return message.channel.send(`The friend code of \`${name}\` from \`${JSON.parse(guild)[0]}\` is \`${friendCode || 'not set'}\`.`);
            }
            return message.channel.send('That user does not exist.');
          } catch (err) {
            console.error(err);
            return message.channel.send('This is not a valid Discord ID');
          }
        }
        return '';
      };
      friendCodes();
    } catch (err) {
      return console.error(err);
    }
    return '';
  },
};
