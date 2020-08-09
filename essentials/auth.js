const Discord = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
// spreadsheet key is the long id in the sheets URL
const doc = new GoogleSpreadsheet('17eFMDOTZuv9eIYI8WYVZH1CPjvr5eLLj6AilHzXEJGQ');
const moment = require('moment');
const auth = require('../config/client_secret.json');
const db = require('../models/index');

const startIndex = 4;
const date = new Date();
const dayN = date.toLocaleString('default', { day: 'numeric' });
const monthN = date.toLocaleString('default', { month: 'numeric' });
const monthS = date.toLocaleString('default', { month: 'long' });

const today = moment().utc().tz('Europe/Lisbon');
const startWeek = today.clone().startOf('week');
const endWeek = today.clone().endOf('week');
const sunday = moment().utc().tz('Europe/Lisbon').day('Sunday');
// const diff = today.diff(sunday, 'days', true);

const daysColumns = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];
// const statsColumns = ['I', 'J'];

const pushStats = async (sheet, guildArray) => {
  try {
    if (!guildArray.length || guildArray.length > 30) throw new Error('Guild members length is not an accceptable value');
    const stats = { weeks: [] };
    let strikes;
    const members = await Promise.all(guildArray.map(async (member, index) => {
      // Sheet Cells
      const i = parseInt(index, 10);
      let cp = await sheet.getCellByA1(`I${i + startIndex}`).formattedValue;
      let gb = await sheet.getCellByA1(`J${i + startIndex}`).formattedValue;
      let idMember = await sheet.getCellByA1(`L${i + startIndex}`).formattedValue;

      // REGEX AND OTHER VARIABLES
      const regex = /^(new)/i;

      if (cp === '-' || !cp) {
        cp = '0';
      }

      if (!gb || gb.match(regex)) {
        gb = '0';
      }

      cp = parseFloat(parseFloat(cp.replace(/,/g, '')).toFixed(3));
      gb = parseInt(gb, 10);
      idMember = parseInt(idMember, 10);

      const status = [];

      // CONTINUE HERE TOMORROW
      for (const column of daysColumns) {
        if (daysColumns.indexOf(column) <= 7) {
          const ind = daysColumns.indexOf(column);
          const colorObj = sheet.getCellByA1(`${column}${i + startIndex}`).backgroundColor;
          const myObj = {};
          const statusDay = today.clone().startOf('week');

          statusDay.add(ind, 'd');
          statusDay.format('YYYY-MM-DD');
          Object.assign(myObj, colorObj);
          myObj.date = statusDay;
          status.push(myObj);
        }
      }

      stats.weeks.push(status);

      // console.log(times);
      await db.Member.update({
        cp,
        gb,
      }, {
        where: {
          idMember,
        },
      });

      return member;
    }));

    for (const member of members) {
      if (member[1].strikes >= 1) {
        strikes = member[1].strikes;
      } else {
        strikes = 0;
      }
    }

    for await (const [index, week] of Object.entries(stats.weeks)) {
      const i = parseInt(index, 10);
      for await (const day of week) {
        const { red, green, blue } = day;

        const [log, created] = await db.Check.findOrCreate({
          where:
          {
            membersIdMember: members[i][1].idMember,
            date: day.date,
          },
          defaults: {
            membersIdMember: members[i][1].idMember,
            date: day.date,
            status: JSON.stringify({ red, green, blue }),
          },
        });

        if (!created) {
          db.Check.update(
            {
              date: day.date,
              status: JSON.stringify({ red, green, blue }),
            }, {
              where: {
                membersIdMember: members[i][1].idMember,
                date: day.date,
              },
            },
          );
        }

        if (day.red === 1) {
          strikes++;
          console.log(`${members[i][1].name} got a strike`);
        }

        // await db.Member.update({
        //   strikes,
        // }, {
        //   where: {
        //     idMember: members[i][1].idMember,
        //   },
        // });
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const getWeek = (input = moment()) => {
  const firstDayOfMonth = input.clone().startOf('month');
  const firstDayOfWeek = firstDayOfMonth.clone().startOf('week');
  const offset = firstDayOfMonth.diff(firstDayOfWeek, 'days');
  return Math.ceil((input.date() + offset) / 7);
};

const authenticate = async () => {
  try {
    await doc.useServiceAccountAuth(auth);
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsById[0];
    await sheet.loadCells('A1:L33');
    return sheet;
  } catch (err) {
    return console.error(err);
  }
};

const membersArray = async (sort, guild) => {
  try {
    let order;
    switch (sort) {
      case 'cp':
        order = ['cp', 'DESC'];
        break;
      case 'gb':
        order = ['gb', 'DESC'];
        break;
      case 'name':
        order = ['name', 'ASC'];
        break;
      default:
        order = ['cp', 'DESC'];
        break;
    }

    const cloversDB = await db.Member.findAll({ order: [order], include: db.Check });

    if (typeof guild === 'string') {
      const cloverHS = cloversDB.filter((member) => {
        if (JSON.parse(member.guild)[0] === guild) {
          return member;
        }
      });
      return cloverHS;
    }

    throw new Error('The argument guild type is not valid');
  } catch (err) {
    return console.error(err);
  }
};

const updateSheet = async (sheet, array) => {
  try {
    // Logs into sheet, pulls members from DB, turns object clover into array
    if (!array.length || array.length > 30) throw new Error('Guild members length is not an accceptable value');
    const weekHeader = await sheet.getCellByA1('B1');
    const guild = Object.entries(array);
    weekHeader.value = `${monthS} ${startWeek.format('D')}th-${endWeek.format('D')}th`;

    for await (let [i, member] of guild) {
      // Sheet Cells
      i = parseInt(i, 10);

      // CHHANGE HERE TO PULL VALUES FROM SHEET NOT DB TO ORGANIZE
      const name = await sheet.getCellByA1(`A${i + startIndex}`);
      const cp = await sheet.getCellByA1(`I${i + startIndex}`);
      const gb = await sheet.getCellByA1(`J${i + startIndex}`);
      const strikes = await sheet.getCellByA1(`K${i + startIndex}`);
      const id = await sheet.getCellByA1(`L${i + startIndex}`);

      name.value = member.name;
      cp.value = member.cp;
      gb.value = member.gb;
      strikes.value = member.strikes;
      id.value = member.idMember;

      // CHANGE HERE TO PULL FROM DATABASE
      for await (const column of daysColumns) {
        if (daysColumns.indexOf(column) <= 6) {
          const index = daysColumns.indexOf(column);
          const info = sheet.getCellByA1(`${column}${i + startIndex}`);
          const statusDay = today.clone().startOf('week');

          info.value = '';
          statusDay.add(index, 'd');
          const dateString = statusDay.format('M-DD-YYYY');

          if (JSON.parse(member.Checks[index].status).green === 1) {
            info.value = '✔';
            // info.backgroundColor = {
            //   alpha: 0, green: 1, red: 0, blue: 0,
            // };
          } else if (JSON.parse(member.Checks[index].status).red === 1) {
            info.value = dateString;
          }
        }
      }
    }

    await sheet.saveUpdatedCells();
  } catch (err) {
    return console.error(err);
  }
  return 0;
};

const updateDB = async (sheet, array) => {
  const guild = Object.entries(array);
  await pushStats(sheet, guild);
};

const update = async (sort, guild, callback) => {
  try {
    const sheet = await authenticate();
    const cloverHS = await membersArray(sort, guild);

    if (guild && callback) {
      if (typeof callback === 'string') {
        if (callback === 'sheet') {
          await updateSheet(sheet, cloverHS);
        }

        if (callback === 'db') {
          await updateDB(sheet, cloverHS);
        }

        return 0;
      }
      throw new Error('Arguments are not valid type');
    }

    throw new Error('Missing or wrong arguments from function');
  } catch (error) {
    return console.error(error);
  }
};

module.exports = {
  dayN, monthN, monthS, update, getWeek,
};
