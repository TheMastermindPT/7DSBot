const fs = require('fs');

const jokes = fs.readFileSync('jokes.txt').toString().split('\n');

// { joke: ] }
module.exports = {
  name: 'insult',
  description: 'List of commands for 7DSPatchBot',
  execute(message, args) {
    const regex = /^<@(!|)\d{18}>$/i;
    if (regex.test(args[0])) {
      const match = new RegExp(/^<@(!|)\d{18}>$/, 'i');
      const sliced = args[0].match(match);
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      message.channel.send(`Hey ${sliced[0]} ${joke}`);
    }
  },
};
