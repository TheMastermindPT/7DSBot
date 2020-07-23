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
            `,
    );
  },
};
