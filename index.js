// REQUIRES//
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const db = require('./models/index');

// VARIABLES //
const { PREFIX, TOKEN } = process.env;
const guildID = '662888155501821953';
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on('ready', async () => {
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
            case '734123385940082698':
              guild.push('CloverHs');
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
      guild = JSON.stringify(guild);

      try {
        const [user, created] = await db.Member.findOrCreate({
          where: { discordId: id },
          defaults: {
            name,
            guild,
            discordId: id,
          },
        });

        if (!created) {
          db.Member.update(
            { name, guild }, { where: { discordId: id } },
          );
        }
      } catch (err) {
        return console.error(err);
      }
    }
  }
  return console.log('Bot is executing!');
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
