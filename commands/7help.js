module.exports = {
  name: '7help',
  description: 'List of commands for 7DSPatchBot',
  execute(message, args) {
    // CHANNEL FRIENDCODES
    if (message.channel.id === '663213318957432887') {
      return message.channel.send(
        `
        List of commands:
        !friend set [yourcode] = Saves your code on a database.
        !friend [discordid] = Search for this user and retrieves his friend code.
        !friend all = An embed with all the friend codes.
        `,
      );
    }
    // CHANNEL RAIDS
    if (message.channel.id === '663214379508170759') {
      return message.channel.send(
        `
        List of commands:
        !friend [discordid] = Search for this user and retrieves his friend code.
        !friend all = An embed with all the friend codes.
        `,
      );
    }

    return message.channel.send(
      `
      List of commands:
      !patch: To display latest patch notes (To come).
      !gear [type] [basestat] : To know if your SSR gear is good to awaken. 
      !gear type : Lets you know the arguments for the specific gear type.
      !friend set [yourcode] = Saves your code on a database.
      !friend [discordid] = Search for this user and retrieves his friend code.
      !friend all = An embed with all the friend codes.
      `,
    );
  },
};
