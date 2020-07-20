const Discord = require('discord.js');
const { sequelize, global } = require('../essentials/database');
const {
  dayN, monthS, weeks, getWeek, authenticate,
} = require('../essentials/auth');

const week = getWeek();
const { Member, Check } = global;

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
        const { sheet, roster, filtered } = await authenticate();
        let counter = 0;
        do {
          const rosterCell = roster.getCellByA1(`A${counter + 1}`);
          rosterCell.value = filtered[0].name;
          counter++;
        } while (counter < filtered.length);

        if (message.member.id === '251509011357106176') {
          console.log('me');
          if (args[0] === 'db') {
            // Connect to DB
            await sequelize.authenticate();
            await sequelize.sync({ force: true });

            for await (const member of filtered) {
              // console.log(`Day : ${getDay}, Month: ${getMonth}`);

              const [user, created] = await Member.findOrCreate({
                where: { name: member.name },
                defaults: {
                  name: member.name,
                  guild: member.guild,
                  cp: member.CP,
                  gb: member.GB,
                  strikes: member.strikes,
                },
              });

              for await (const status of member.days) {
                const {
                  red, green, blue,
                } = status;

                const date = new Date(status.day);
                const getDay = date.getDate();
                const getMonth = date.getMonth();

                // PROBLEM data is being overrided everytime it loops each day?//
                if (created) {
                  console.log('created');
                  await Check.create(
                    { membersIdMembers: user.idMembers, date, status: JSON.stringify({ red, green, blue }) },
                  );
                } else {
                  const [checked, unexsisting] = await Check.findOrCreate({
                    where: { membersIdMembers: user.idMembers },
                    defaults: {
                      date: status.day,
                      status: JSON.stringify({ red, green, blue }),
                    },
                  });

                  if (!unexsisting) {
                    await Check.update(
                      {
                        date: status.day,
                        status: JSON.stringify({ red, green, blue }),
                      }, {
                        where: {
                          membersIdMembers: user.idMembers,
                          date: status.day,
                        },
                      },
                    );
                  }
                }
              }
            }
          }
        } else {
          message.channel.send('You are not allowed to use this command.');
        }

        await sheet.saveUpdatedCells();
        if (args[0] === 'strike') {
          let times = 0;
          let columns = 0;

          for (member of filtered) {
            let failed = member.days.map((element, index) => {
              // Resets Check-ins every week and counts how many times someone didnt
              if (columns <= 7) {
                columns++;

                if (columns === 7) {
                  times = 0;
                }

                if (element.red === 1) {
                  times++;

                  if (times === 3) {
                    member.strike = true;
                  }

                  return true;
                }
                return false;
              }
              columns = 0;
            });

            failed = failed.filter((el) => (el || false));

            if (member.strike) {
              message.channel.send(`${member.name} got a check-in strike.`);
            }
          }
        }

        if (args[0] === 'hs') {
          if (args[1] === 'mcp') {
            let sum = 0;
            const memSum = filtered.length;
            for (const member of filtered) {
              sum += member.CP;
            }
            message.channel.send(`Median CP of Clover-HS : ${(sum / memSum).toFixed(3)}K`);
          }

          if (args[1] === 'mgb') {
            let sum = 0;
            const memSum = filtered.length;
            for (member of filtered) {
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
                const sortCP = filtered.sort(mostCP);
                const removed = sortCP.splice(10);
                for (const member of sortCP) {
                  exampleEmbed.setTitle(`Guild Top 10/ ${week} of ${monthS} by CP`);
                  exampleEmbed.addFields({ name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true });
                }
              } else if (args[1] === 'bcp') {
                const sortCP = filtered.sort(mostCP);
                const removed = sortCP.splice(sortCP.length - 10);
                for (const member of removed) {
                  exampleEmbed.setTitle(`Guild Bottom 10/ ${week} of ${monthS} by CP`);
                  exampleEmbed.addFields({ name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true });
                }
              }
              if (args[1] === 'tgb') {
                const sortGB = filtered.sort(mostGB);
                const removed = sortGB.splice(10);
                for (const member of sortGB) {
                  exampleEmbed.setTitle(`Guild Top 10/ ${week} of ${monthS} by GB`);
                  exampleEmbed.addFields({ name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true });
                }
              } else if (args[1] === 'bgb') {
                const sortGB = filtered.sort(mostGB);
                const removed = sortGB.splice(sortGB.length - 10);
                for (const member of removed) {
                  exampleEmbed.setTitle(`Guild Bottom 10/ ${week} of ${monthS} by CP`);
                  exampleEmbed.addFields({ name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true });
                }
              }
              message.channel.send(exampleEmbed);
            };
            sendEmbed(filtered);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }());
  },
};
