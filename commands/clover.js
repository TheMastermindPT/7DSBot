const Discord = require('discord.js');
const moment = require('moment');
const { db } = require('../models/index');
const { monthS, update } = require('../essentials/auth');

const mostCP = (a, b) => {
  if (a.CP < b.CP) {
    return 1;
  }
  return -1;
};

const mostGB = (a, b) => {
  if (a.GB < b.GB) {
    return 1;
  }
  return -1;
};

module.exports = {
  name: 'clover',
  description: 'Spreadsheet functions...',
  execute(message, args) {
    (async function () {
      try {
        if (args[0] === 'test') {
          console.log(moment(message.member.joinedAt).format('DD-MM-YYYY'));
          console.log(moment(message.createdAt));
          console.log();
        }
        // NEED UPDATE FUCNTION HERE TO WORK
        // Fikpik and Tugalife ID
        if (message.member.id === '214429377696497665' || message.member.id === '251509011357106176') {
          if (args[0] === 'sheetcp') {
            sort = 'cp';
            updateSheet(sort);
            return message.channel.send('Spreadsheet ordered by cp successfully.');
          }

          if (args[0] === 'sheetgb') {
            sort = 'gb';
            updateSheet(sort);
            return message.channel.send('Spreadsheet ordered by gb successfully.');
          }

          if (args[0] === 'sheetaz') {
            sort = 'name';
            updateSheet(sort);
            return message.channel.send('Spreadsheet ordered alphabetically with success.');
          }
        }

        if (args[0] === 'hs') {
          if (args[1] === 'mcp') {
            let sum = 0;
            const memSum = cloverHS.length;
            for (const member of cloverHS) {
              sum += member.CP;
            }
            message.channel.send(`Median CP of Clover-HS : ${(sum / memSum).toFixed(3)}K`);
          }

          if (args[1] === 'mgb') {
            let sum = 0;
            const memSum = cloverHS.length;
            for (const member of cloverHS) {
              sum += member.GB;
            }
            message.channel.send(`Median GB points of Clover-HS : ${(sum / memSum).toFixed(1)}`);
          }

          const regex2 = /(tcp|bcp|tgb|bgb)/gm;

          if (regex2.test(args[1])) {
            const sendEmbed = () => {
              const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#821d01')
                .setThumbnail('https://imgur.com/AADFtyL.jpg');
              if (args[1] === 'tcp') {
                const sortCP = cloverHS.sort(mostCP);
                const removed = sortCP.splice(10);
                for (const member of sortCP) {
                  exampleEmbed.setTitle(`Guild Top 10/ ${week} of ${monthS} by CP`);
                  exampleEmbed.addFields({ name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true });
                }
              } else if (args[1] === 'bcp') {
                const sortCP = cloverHS.sort(mostCP);
                const removed = sortCP.splice(sortCP.length - 10);
                for (const member of removed) {
                  exampleEmbed.setTitle(`Guild Bottom 10/ ${week} of ${monthS} by CP`);
                  exampleEmbed.addFields({ name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true });
                }
              }
              if (args[1] === 'tgb') {
                const sortGB = cloverHS.sort(mostGB);
                const removed = sortGB.splice(10);
                for (const member of sortGB) {
                  exampleEmbed.setTitle(`Guild Top 10/ ${week} of ${monthS} by GB`);
                  exampleEmbed.addFields({ name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true });
                }
              } else if (args[1] === 'bgb') {
                const sortGB = cloverHS.sort(mostGB);
                const removed = sortGB.splice(sortGB.length - 10);
                for (const member of removed) {
                  exampleEmbed.setTitle(`Guild Bottom 10/ ${week} of ${monthS} by CP`);
                  exampleEmbed.addFields({ name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true });
                }
              }
              message.channel.send(exampleEmbed);
            };
            sendEmbed(cloverHS);
          }
        }
      } catch (err) {
        console.error(err);
      }
      return 0;
    }());
  },
};
