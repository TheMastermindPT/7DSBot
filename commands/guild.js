// GOOGLE STUFF//
const Discord = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
// spreadsheet key is the long id in the sheets URL
const doc = new GoogleSpreadsheet('18g1jJoEYV40skkuq9T5OW_UojGmG1g5D14jO6owBgJg');
const auth = require('../configs/client_secret.json');

const date = new Date();
const day = date.toLocaleString('default', { day: 'numeric' });
const month = date.toLocaleString('default', { month: 'numeric' });
const monthName = date.toLocaleString('default', { month: 'long' });
const monthIndex = {
  7: 0,
  8: 1,
  9: 2,
  10: 3,
  11: 4,
  12: 5,
  1: 6,
  2: 7,
  3: 8,
  4: 9,
  5: 10,
  6: 11,
};
const weeks = {
  'Week 1': ['1', '2', '3', '4'],
  'Week 2': ['5', '6', '7', '8', '9', '10', '11'],
  'Week 3': ['12', '13', '14', '15', '16', '17', '18'],
  'Week 4': ['19', '20', '21', '22', '23', '24', '25'],
  'Week 5': ['26', '27', '28', '29', '30', '31'],
};

let weekNumber;
let sheetIndex;

async function authenticate() {
  try {
    await doc.useServiceAccountAuth(auth);
    await doc.loadInfo(); // loads document properties and worksheets
    /* console.log(doc.sheetsById); */
    return;
  } catch (err) {
    console.error(err);
  }
}

function mostCP(a, b) {
  if (a.CP < b.CP) {
    return 1;
  }
  return -1;
}

function mostGB(a, b) {
  if (a.GB < b.GB) {
    return 1;
  }
  return -1;
}

module.exports = {
  name: 'guild',
  description: 'Spreadsheet functions...',
  execute(message, args) {
    (async function () {
      try {
        for (const [monthNumber, index] of Object.entries(monthIndex)) {
          if (monthNumber === month) {
            sheetIndex = index;
          }
        }
        console.log(day);
        // eslint-disable-next-line guard-for-in
        for (week of Object.entries(weeks)) {
          for (days of Object.values(week)[1]) {
            if (days === day) {
              weekNumber = this.week[0];
            }
          }
        }

        await authenticate();
        const roster = await doc.sheetsById[346544522];
        const sheet = await doc.sheetsByIndex[sheetIndex];
        const members = [];
        await roster.loadCells('A1:A30'); // A1 range
        await sheet.loadCells('B4:V67');
        const weekStats = {
          Week: weekNumber, cp: [], contribution: [], days: [],
        };

        const strikeColumns1 = ['C', 'D', 'E', 'F', 'G', 'H', 'I'];
        const strikeColumns2 = ['N', 'O', 'P', 'Q', 'R', 'S', 'T'];

        const pushStats = (cells, cpColumn, gbColumn, strikeColumns, startIndex) => {
          for (i = 0; i < 30; i++) {
            weekStats.cp.push(cells.getCellByA1(`${cpColumn}${i + startIndex}`).formattedValue);
            weekStats.contribution.push(cells.getCellByA1(`${gbColumn}${i + startIndex}`).formattedValue);
            const colors = [];

            for (column of strikeColumns) {
              if (strikeColumns.indexOf(column) <= 7) {
                colors.push(cells.getCellByA1(`${column}${i + startIndex}`).backgroundColor);
              }
            }

            weekStats.days.push(colors);
          }
        };

        for (i = 0; i < 30; i++) {
          members.push({ name: roster.getCellByA1(`A${i + 1}`).formattedValue });
        }

        switch (weekNumber) {
          case 'Week 1':
            console.log('Week 1');
            pushStats(sheet, 'J', 'K', strikeColumns1, 4);
            break;
          case 'Week 2':
            console.log('Week 2');
            pushStats(sheet, 'U', 'V', strikeColumns2, 4);
            break;
          case 'Week 3':
            console.log('Week 3');
            pushStats(sheet, 'J', 'K', strikeColumns1, 38);
            break;
          case 'Week 4':
            console.log('Week 4');
            pushStats(sheet, 'U', 'V', strikeColumns2, 38);
            break;
          default:
            console.log('This week is non-existent');
            break;
        }

        for (member in members) {
          members[member].CP = weekStats.cp[member];
          members[member].GB = weekStats.contribution[member];
          members[member].days = weekStats.days[member];
          members[member].strike = false;
        }

        const regex = /^new/gim;
        // const reqs = /^\b([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|10[0-9]{2}|11[0-8][0-9]|119[0-9])\b/gm;

        const filtered = members.filter((member) => {
          if (member.name) {
            if (member.CP === '-' || !member.CP) {
              member.CP = '0';
            }

            // if (member.GB.match(reqs)) {
            //   member.strike = true;
            // }

            if (member.GB.match(regex)) {
              member.GB = '0';
            }

            member.CP = parseFloat(parseFloat(member.CP.replace(/,/g, '.')).toFixed(1));
            member.GB = parseInt(member.GB, 10);
            return member;
          }
        });

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

        if (args[0] === 'members') {
          if (args[1] === 'mcp') {
            let sum = 0;
            const memSum = filtered.length;
            for (member of filtered) {
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
            message.channel.send(`Median GB points of Clover-HS : ${(sum / memSum).toFixed(1)}K`);
          }

          const regex2 = /(tcp|bcp|tgb|bgb)/gm;

          if (regex2.test(args[1])) {
            const sendEmbed = (filtered) => {
              const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#821d01')
                .setThumbnail('https://imgur.com/AADFtyL.jpg');
              if (args[1] === 'tcp') {
                sortCP = filtered.sort(mostCP);
                const removed = sortCP.splice(10);
                for (member of sortCP) {
                  exampleEmbed.setTitle(`Guild Top 10/ ${weekNumber} of ${monthName} by CP`);
                  exampleEmbed.addFields({ name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true });
                }
              } else if (args[1] === 'bcp') {
                sortCP = filtered.sort(mostCP);
                const removed = sortCP.splice(sortCP.length - 10);
                for (member of removed) {
                  exampleEmbed.setTitle(`Guild Bottom 10/ ${weekNumber} of ${monthName} by CP`);
                  exampleEmbed.addFields({ name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true });
                }
              }
              if (args[1] === 'tgb') {
                sortGB = filtered.sort(mostGB);
                const removed = sortGB.splice(10);
                for (member of sortGB) {
                  exampleEmbed.setTitle(`Guild Top 10/ ${weekNumber} of ${monthName} by GB`);
                  exampleEmbed.addFields({ name: member.name, value: `CP: ${member.CP} GB: ${member.GB}`, inline: true });
                }
              } else if (args[1] === 'bgb') {
                sortGB = filtered.sort(mostGB);
                const removed = sortGB.splice(sortGB.length - 10);
                for (member of removed) {
                  exampleEmbed.setTitle(`Guild Bottom 10/ ${weekNumber} of ${monthName} by CP`);
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
