const fs = require('fs');
const Discord = require('discord.js');
const {token, prefix} = require('./config.json');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const PREFIX = '?'; 

//Initiates the bot
client.on('ready', () => {
    console.log('Meliodas ready to hand out patch notes');
});

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('message', async message => {
  
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
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
client.login(token);
