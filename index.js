// REQUIRES//
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const db = require('./models/index');
const { update } = require('./essentials/auth');

// VARIABLES //
const { PREFIX, TOKEN } = process.env;
const guildID = '662888155501821953';
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
let newMember;

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

  return 0;
};

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on('ready', async () => {
  await discordToDB();
  const generalChat = client.channels.cache.find((channel) => channel.id === '662888155501821956');
  // Update db must be in same order as updatesheet
  // await update('gb', 'CloverHS', 'sheet');
  return console.log('Bot is executing!');
});

// Create an event listener for new guild members
client.on('guildMemberAdd', async (member) => {
  await discordToDB();
  newMember = member;
  console.log(member);
  console.log('New member in discord');
});

client.on('guildMemberUpdate', async (member) => {
  await discordToDB();
  const generalChat = client.channels.cache.find((channel) => channel.id === '734182168213061723');

  const clover = newMember.roles.cache.find((role) => role.id === '734123118402076672');
  const cloverHS = newMember.roles.cache.find((role) => role.id === '734123385940082698');
  const cloverUR = newMember.roles.cache.find((role) => role.id === '735107783900528751');

  if (clover || cloverHS || cloverUR) {
    generalChat.send(`@${clover.name} Send a warm welcome to our new member ${member.username ? member.username : member.nickname}`);
  }

  newMember = 0;
  console.log('Discord member was updated');
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
