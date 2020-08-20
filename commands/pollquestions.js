const Discord = require('discord.js');

const question1 = new Discord.MessageEmbed()
  .setColor('#592a92')
  .setTitle('Leadership Pool')
// eslint-disable-next-line quotes
  .setThumbnail('https://imgur.com/HajHOyU.jpg')
  .addFields(
    { name: 'Question#1:', value: 'What can you provide to the new guild as a leader?', inline: true },
  )
  .setTimestamp();

const question2 = new Discord.MessageEmbed()
  .setColor('#592a92')
  .setTitle('Leadership Pool')
// eslint-disable-next-line quotes
  .setThumbnail('https://imgur.com/HajHOyU.jpg')
  .addFields(
    { name: 'Question#2:', value: 'What would you do to calm down an argument beetween 2 members?', inline: true },
  )
  .setTimestamp();

const question3 = new Discord.MessageEmbed()
  .setColor('#592a92')
  .setTitle('Leadership Pool')
// eslint-disable-next-line quotes
  .setThumbnail('https://imgur.com/HajHOyU.jpg')
  .addFields(
    { name: 'Question#3:', value: 'For how many hours can you be active on Discord & In-game?', inline: true },
  )
  .setTimestamp();

const question4 = new Discord.MessageEmbed()
  .setColor('#592a92')
  .setTitle('Leadership Pool')
// eslint-disable-next-line quotes
  .setThumbnail('https://imgur.com/HajHOyU.jpg')
  .addFields(
    { name: 'Question#4:', value: 'What\'s your age?', inline: true },
  )
  .setTimestamp();

const question5 = new Discord.MessageEmbed()
  .setColor('#592a92')
  .setTitle('Leadership Pool')
// eslint-disable-next-line quotes
  .setThumbnail('https://imgur.com/HajHOyU.jpg')
  .addFields(
    { name: 'Question#5:', value: 'Would you be open to discuss and propose ideias to the leadership?', inline: true },
  )
  .setTimestamp();

const question6 = new Discord.MessageEmbed()
  .setColor('#592a92')
  .setTitle('Leadership Pool')
// eslint-disable-next-line quotes
  .setThumbnail('https://imgur.com/HajHOyU.jpg')
  .addFields(
    { name: 'Question#6:', value: 'Would you help a player and track his progress if he asked you?', inline: true },
  )
  .setTimestamp();

const question7 = new Discord.MessageEmbed()
  .setColor('#592a92')
  .setTitle('Leadership Pool')
// eslint-disable-next-line quotes
  .setThumbnail('https://imgur.com/HajHOyU.jpg')
  .addFields(
    { name: 'Question#7:', value: 'Do you have any experience in these kind of roles?', inline: true },
  )
  .setTimestamp();

const question8 = new Discord.MessageEmbed()
  .setColor('#592a92')
  .setTitle('Leadership Pool')
// eslint-disable-next-line quotes
  .setThumbnail('https://imgur.com/HajHOyU.jpg')
  .addFields(
    { name: 'Question#8:', value: 'How long have you been playing grand cross?', inline: true },
  )
  .setTimestamp();

module.exports = { questions: [question1, question2, question3, question4, question5, question6, question7, question8] };
