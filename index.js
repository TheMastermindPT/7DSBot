// REQUIRES//
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const { membersArray } = require('./essentials/auth');
const db = require('./models/index');

// VARIABLES //
const { PREFIX, TOKEN } = process.env;
const MENTIONABLE = /(<@!|)(\d{18})>/i;
const GUILDID = '753760393087680592';
const GUILDCHAT = '753766005209301082';
const INDURA = '757761628262367292';
const ALECOLLECTORS = '753786077000630284';
const MEMBERSCOUNTCATEGORY = '753789314680488018';
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
const guildRoles = ['753786077000630284'];

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const addMembersFromDiscordToDb = async (members) => {
  try {
    const insomniacs = members.map((member) => {
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
              case ALECOLLECTORS:
                guild.push('Insomniacs');
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
    for await (const member of insomniacs) {
      if (member.length) {
        let name = '';

        if (member[0].nick) {
          name = member[0].nick.replace(/[^a-zA-Z0-9]/g, '');
        } else {
          name = member[0].username.replace(/[^a-zA-Z0-9]/g, '');
        }
        // eslint-disable-next-line prefer-const
        let [{ id }, ...guild] = member;
        guild.sort();
        const guildJSON = JSON.stringify(guild);

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
          const userInDatabase = await db.Member.findOne({ where: { discordId: id } });
          if (userInDatabase) {
            await db.Check.destroy({ where: { membersIdMember: userInDatabase.idMember } });
            await db.Image.destroy({ where: { membersIdMember: userInDatabase.idMember } });
            await db.Member.destroy({ where: { discordId: id } });
          }
        }
      }
    }
    return insomniacs;
  } catch (err) {
    console.error(err);
  }
};

const discordToDB = async () => {
  try {
    const insomniacs = await client.guilds.fetch(GUILDID);
    const members = insomniacs.members.cache.map((member) => {
      if (!member.user.bot) {
        return member;
      }
      return {};
    });
    addMembersFromDiscordToDb(members);
    return members;
  } catch (err) {
    console.error(err);
  }
};

const membersCount = (members) => {
  const guild = client.guilds.cache.get(GUILDID);
  const category = guild.channels.cache.find((c) => c.id === MEMBERSCOUNTCATEGORY);
  if (!category) throw new Error('Category channel does not exist');

  const insomniacs = guild.channels.cache.find((c) => c.id === '757760492952354816');

  let main = 0;

  for (const member of members) {
    if (Object.keys(member).length) {
      const roles = member.roles.cache;

      for (const [index, role] of roles) {
        switch (role.id) {
          case '':
            main++;
            break;
          default:
            break;
        }
      }
    }
  }

  // Not updating in real time dont know why //
  insomniacs.edit({ name: `Insomniacs: ${main}` });
};

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
    membersArray('cp', 'Insomniacs');
    // Update db must be in same order as updatesheet
    membersCount(members);
    // await update('cp', 'CloverHS', 'db');
    return console.log('Bot is executing!');
  } catch (err) {
    console.error(err);
  }
  return 0;
});

// Create an event listener for new guild members
client.on('guildMemberAdd', async () => {
  await discordToDB();
  console.log('New member in discord');
});

client.on('guildMemberRemove', async (member) => {
  try {
    const welcomeChannel = client.channels.cache.find((channel) => channel.id === GUILDCHAT);
    const found = await db.Member.findOne({ where: { discordId: member.id } });
    if (!found.length) throw new Error('The found object is empty');

    await db.Check.destroy({ where: { membersIdMember: found.idMember } });
    await db.Image.destroy({ where: { membersIdMember: found.idMember } });
    await db.Member.destroy(found);
    console.log(`The member ${member.user.username} was kicked from the server`);
    return welcomeChannel.send(`Our member <@${member.id}> left or was kicked from the server`);
  } catch (err) {
    console.error(err);
  }
  return '';
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    const members = await discordToDB();
    membersCount(members);
    console.log('Discord member was updated');

    // TEST CHANNEL
    const newRoles = newMember.roles.cache;
    const oldRoles = oldMember.roles.cache;
    const diff = oldRoles.difference(newRoles);
    const welcomeChannel = client.channels.cache.find((channel) => channel.id === GUILDCHAT);

    const guildRole = await awaitRole(diff, (role) => {
      const some = guildRoles.some((value) => value === role.id);
      if (some) {
        return role;
      }
    });

    if (guildRole.length) {
      const found = oldRoles.find((role) => role.id === guildRole[0].id);

      const guildRolesNames = [];

      for (const [index, role] of newRoles) {
        const some = guildRoles.some((value) => value === role.id);
        if (some) {
          guildRolesNames.push(role.name);
        }
      }

      db.Member.update({ guild: JSON.stringify(guildRolesNames) },
        { where: { discordId: newMember.id } });

      if (!found) {
        return welcomeChannel.send(`A warm welcome to our new member <@${newMember.id}> that just joined \`${guildRole[0].name}\``);
      }

      const user = await db.Member.findOne({ where: { discordId: newMember.id } });
      db.Check.destroy({ where: { membersIdMember: user.idMember } });
      db.Image.destroy({ where: { membersIdMember: user.idMember } });
      await update('cp', 'CloverHS', 'sheet');
      return welcomeChannel.send(`Our member <@${newMember.id}> just left \`${guildRole[0].name}\``);
    }
  } catch (err) {
    console.error(err);
  }
  return 0;
});

client.on('message', async (message) => {
  try {
    if (!message.content.startsWith(PREFIX) && MENTIONABLE.test(message.content)) {
      const mentionUserId = message.content.match(MENTIONABLE)[2];
      const memberMentioned = message.channel.members.find((member) => member.user.id === mentionUserId);
      if (!memberMentioned) return;
      const mentionedUserRoles = memberMentioned.roles.cache;
      const memberHasInduraRole = mentionedUserRoles.find((role) => role.id === INDURA);

      // eslint-disable-next-line max-len
      const mentionedUserInGuild = await db.Member.findOne({ where: { discordId: mentionUserId }, include: db.Image });

      if (!memberHasInduraRole || !mentionedUserInGuild || !mentionedUserInGuild.Images) return;

      const imageOfIndura = mentionedUserInGuild.Images[0].url;

      const regex = /(.jpg|.png|.gif|.jpeg)$/i;
      if (regex.test(imageOfIndura)) return message.channel.send('', { files: [`${imageOfIndura}`] });

      return message.channel.send('', { files: [`${imageOfIndura}.gif`] });
    }

    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;
    client.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
  }
});

// Authenticates the bot with the token
client.login(TOKEN);
