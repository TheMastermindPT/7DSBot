module.exports = {
  name: '7help',
  description: 'List of commands for 7DSPatchBot',
  execute(message, args) {
    message.channel.send(
      `
            List of commands:
            !patch: To display latest patch notes (To come).
            !gear [type] [basestat] : To know if your SSR gear is good to awaken. 
            !gear info : Lets you know acceptable base stat values for the gear tool.
            !friend set [yourcode] = Saves your code on a database.
            !friend [username] = Search for this user and retrieves his friend code.
            !friend all = An embed with all the friend codes.
            `,
    );
  },
};
