// REQUIRES//
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const moment = require('moment');
const { isArray } = require('util');
const db = require('./models/index');
const { update } = require('./essentials/auth');

// VARIABLES //
const { PREFIX, TOKEN } = process.env;
const guildID = '662888155501821953';
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

const discordToDB = async () => {
  const cloverDiscord = client.guilds.cache.find((guild) => guild.id === guildID);
  const members = cloverDiscord.members.cache.map((member) => {
    if (!member.user.bot) {
      return member;
    }
    return {};
  });

  const clovers = members.map((member) => {
    if (member.user) {
      const { user, nickname } = member;
      const name = member.user.username;
      const guild = [user];

      if (nickname) {
        guild[0].nick = nickname;
      }

      if (member._roles) {
        const { _roles } = member;
        for (const role of _roles) {
          switch (role) {
            case '734392418203598930':
              guild.push('Friends of Guild');
              break;
            case '735107783900528751':
              guild.push('CloverUR');
              break;
            case '734123385940082698':
              guild.push('CloverHS');
              break;
            case '734123118402076672':
              guild.push('Clover');
              break;
            default:
              break;
          }
        }
        return guild;
      }
    }
    return [];
  });

  // Add member or update to DB from Discord
  for await (const member of clovers) {
    if (member.length) {
      let name = '';

      if (member[0].nick) {
        name = member[0].nick.replace(/(c ł)|[^a-zA-Z0-9]/g, '');
      } else {
        name = member[0].username.replace(/(c ł)|[^a-zA-Z0-9]/g, '');
      }
      // eslint-disable-next-line prefer-const
      let [{ id }, ...guild] = member;
      guild.sort();
      const guildJSON = JSON.stringify(guild);

      try {
        // Creates or updates user if it belongs to one of the guilds or friends of Guild
        if (JSON.parse(guildJSON).length) {
          const [user, created] = await db.Member.findOrCreate({
            where: { discordId: id },
            defaults: {
              name,
              guild: guildJSON,
              discordId: id,
            },
          });

          if (!created) {
            db.Member.update(
              { name, guild: guildJSON }, { where: { discordId: id } },
            );
          }
        } else {
          db.Member.destroy({
            where: {
              discordId: id,
            },
          });
        }
      } catch (err) {
        return console.error(err);
      }
    }
  }

  return members;
};

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const awaitRole = async (collection, predicate) => {
  try {
    const guildRole = await Promise.all(collection.map(predicate));
    return guildRole.filter((el) => el);
  } catch (err) {
    console.error(err);
  }
};

client.on('ready', async () => {
  try {
    const members = await discordToDB();
    const guild = client.guilds.cache.get('662888155501821953');
    const category = guild.channels.cache.find((c) => c.id === '734907156410663084');
    if (!category) throw new Error('Category channel does not exist');

    const clover = guild.channels.cache.find((c) => c.id === '741046564528717947');
    const cloverHS = guild.channels.cache.find((c) => c.id === '741046688252297256');
    const cloverUR = guild.channels.cache.find((c) => c.id === '741046764706070649');

    let main = 0;
    let hs = 0;
    let ur = 0;

    for await (const member of members) {
      if (Object.keys(member).length) {
        const roles = member.roles.cache;

        for (const [index, role] of roles) {
          switch (role.id) {
            case '734123118402076672':
              // if (member.nickname) {
              //   console.log(`Nick: ${member.nickname}`);
              // } else {
              //   console.log(`username: ${member.user.username}`);
              // }
              main++;
              break;
            case '734123385940082698':
              hs++;
              break;
            case '735107783900528751':
              ur++;
              break;
            default:
              break;
          }
        }
      }

      // console.log(`Main : ${main} / HS : ${hs} / UR: ${ur}`);
    }

    clover.edit({ name: `Clovers: ${main}` });
    cloverHS.edit({ name: `CloversHS: ${hs}` });
    cloverUR.edit({ name: `CloversUR: ${ur}` });

    // Update db must be in same order as updatesheet
    // await update('gb', 'CloverHS', 'sheet');
    return console.log('Bot is executing!');
  } catch (err) {
    console.error(err);
  }
});

// Create an event listener for new guild members
client.on('guildMemberAdd', async (member) => {
  await discordToDB();
  newMember = member;
  console.log(member);
  console.log('New member in discord');
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    await discordToDB();

    // TEST CHANNEL
    const welcomeChannel = client.channels.cache.find((channel) => channel.id === '740212787976077373');
    const guildRoles = ['734123118402076672', '734123385940082698', '735107783900528751'];

    const newRoles = newMember.roles.cache;
    const oldRoles = oldMember.roles.cache;
    const diff = oldRoles.difference(newRoles);

    const guildRole = await awaitRole(diff, (role) => {
      const some = guildRoles.some((value) => value === role.id);
      if (some) {
        return role;
      }
    });

    if (guildRole.length) {
      const found = oldRoles.find((role) => role.id === guildRole[0].id);

      if (!found) {
        return welcomeChannel.send(`A warm welcome to our new member <@${newMember.id}> that just joined \`${guildRole[0].name}\``);
      }
      return welcomeChannel.send(`Our member <@${newMember.id}> just left \`${guildRole[0].name}\``);
    }

    console.log('Discord member was updated');
  } catch (err) {
    console.error(err);
  }
});

client.on('message', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (!client.commands.has(command)) return;
  try {
    client.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
});

// Authenticates the bot with the token
client.login(TOKEN);
