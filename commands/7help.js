module.exports = {
  name: '7help',
  description: 'List of commands for 7DSPatchBot',
  execute(message, args) {
    return message.channel.send(
      `
      List of commands:
      !patch: To display latest patch notes (To come).
      !gear [type] [basestat] : To know if your SSR gear is good to awaken. 
      !subcost [rarity]: Gives you average cost of maxing a substat based on the rarity of the gear. Ex: !subcost r
      !friend set [friendcode] = Saves your code on a database. (ONLY works in friend codes channel).
      !friend [@mention] = Search for this user and retrieves his friend code.
      !indura set [linktoimage] = Only available to induras. Saves a picture to the database.
      `,
    );
  },
};
