const Discord = require('discord.js');
const { questions } = require('./pollquestions.js');

module.exports = {
  name: 'poll',
  description: 'List of commands for 7DSPatchBot',
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
        }, { max: 18, time: 10000, errors: ['time'] });

        let counter = 1;
        collector.on('collect', (reply) => {
          const botEmbed = channel.messages.cache.find((m) => m.author.id === '728247266812624916');
          collector.dispose(botEmbed);
          // const userMessages = channel.messages.cache.find((m) => m.author.id === id);
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

              if (reply.content.length >= 2 && reply.content !== 'yes' && reply.content !== 'no') {
                channel.send(questions[counter]);
                counter++;
              }

              if (reply.content.length <= 1) {
                counter = 0;
                collector.stop();
                return channel.send('Answer was too short.');
              }

              return true;
            }
            counter = 0;
            collector.stop();
            return channel.send(`\`Your application has been sent ${reply.author.username}\``);
          }
        });

        collector.on('end', (collected, reason) => {
          console.log(collected);
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
