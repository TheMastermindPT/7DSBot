const Discord = require('discord.js');
const { questions } = require('./pollquestions.js');
const db = require('../models/index.js');

module.exports = {
  name: 'poll',
  description: 'Poll for guild leadership roles',
  execute(message, args) {
    (async function initPoll() {
      try {
        const { channel } = message;
        const { id } = message.author;
        const { username } = message.author;
        const { nick } = message.author;

        const poll = new Discord.MessageEmbed()
          .setColor('#592a92')
          .setTitle('Leadership Pool')
          // eslint-disable-next-line quotes
          .setDescription(`Do you think you have the qualities to be a guild leader? If so, you will be presented with a set of questions to let the management team decide if you can join it.\n Answer \`yes\` to continue, \`no\` to cancel this message.`)
          .setTimestamp();

        message.channel.send(poll);

        const collector = new Discord.MessageCollector(channel, (m) => {
          if (m.author.id === '728247266812624916' || m.author.id === id) {
            return m;
          }
        }, { max: 18, time: 20000, errors: ['time'] });

        let counter = 1;

        collector.on('collect', function (reply) {
          const userMessages = channel.messages.cache.find((m) => m.author.id === id);
          const botEmbed = channel.messages.cache.find((m) => m.author.id === '728247266812624916');
          this.dispose(botEmbed);
          if (reply.author.id === id && !reply.author.bot) {
            channel.messages.delete(botEmbed);
            if (counter >= 1 && counter <= 7) {
              collector.resetTimer({ time: 180000 });
              if (reply.content === 'yes') {
                channel.send(questions[0]);
                counter++;
              }
              if (reply.content === 'no') {
                counter = 0;
                collector.stop();
              }

              if (counter > 0 && reply.content !== 'yes' && reply.content !== 'no') {
                channel.send(questions[counter]);
                counter++;
              }

              if (reply.content.length < 2) {
                counter = 0;
                collector.stop();
                return channel.send('Answer was too short. The poll was cancelled.');
              }

              return true;
            }
            counter = 0;
            collector.stop();
            return channel.send(`\`Your application has been sent ${reply.author.username}\``);
          }
        });

        collector.on('end', (collected, reason) => {
          const filteredPoll = collected.filter((user) => user.author.id !== '728247266812624916');
          let answers = [];

          for (const userMessage of filteredPoll) {
            answers.push({
              discordId: userMessage[1].author.id,
              username:
              userMessage[1].author.nick
                ? userMessage[1].author.nick
                : userMessage[1].author.username,
              answer: userMessage[1].content,
            });
          }
          // console.log(answers);
          db.Member.findOne({ where: { discordId: answers[0].discordId } }).then((userOnDB) => {
            if (!userOnDB) throw new Error('No user with that discordId was found on the database');
            answers = JSON.stringify(answers);
            db.Poll.findOrCreate({
              defaults: {
                answers,
              },
              where: {
                membersIdMember: userOnDB.idMember,
              },
            }).then((created) => {
              if (!created) {
                db.Poll.update({ answers }, { where: { membersIdMember: userOnDB.idMember } })
                  .then(() => console.log('A poll was updated'))
                  .catch((err) => console.error(err));
              }
            });
          }).catch((err) => console.error(err));
        });

        collector.on('dispose', (dispose) => {
          console.log(dispose);
        });
      } catch (err) {
        console.error(err);
      }
    }());
  },
};
