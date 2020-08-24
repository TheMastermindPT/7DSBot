const fs = require('fs');

const jokes = fs.readFileSync('jokes.txt').toString().split('\n');

module.exports = {
  name: 'insult',
  description: 'Randomizes a joke and insults the person mentioned',
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
