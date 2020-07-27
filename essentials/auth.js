const Discord = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
// spreadsheet key is the long id in the sheets URL
const doc = new GoogleSpreadsheet('1btEAaXL9N702YZ2pagw98C2GKt7FzWcPq5dWVuGxp1U');
const moment = require('moment');
const auth = require('../config/client_secret.json');
const db = require('../models/index');

const date = new Date();
const dayN = date.toLocaleString('default', { day: 'numeric' });
const monthN = date.toLocaleString('default', { month: 'numeric' });
const monthS = date.toLocaleString('default', { month: 'long' });
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

const today = moment().utc().tz('Europe/Lisbon');
const startWeek = today.clone().startOf('week');
const endWeek = today.clone().endOf('week');
const sunday = moment().utc().tz('Europe/Lisbon').day('Sunday');
const diff = today.diff(sunday, 'days', true);

const weeks = {
  'Week 1': ['1', '2', '3', '4', '5', '6', '7'],
  'Week 2': ['8', '9', '10', '11', '12', '13', '14'],
  'Week 3': ['15', '16', '17', '18', '19', '20', '21'],
  'Week 4': ['22', '23', '24', '25', '26', '27', '28'],
  'Week 5': ['29', '30', '31'],
};

const getWeek = () => {
  for (week of Object.entries(weeks)) {
    for (days of Object.values(week)[1]) {
      if (days === dayN) {
        const getWeek = week[0];
        return getWeek;
      }
    }
  }
};

const strikeColumnsDays = ['C', 'D', 'E', 'F', 'G', 'H', 'I'];
const strikeColumnsPoints = ['J', 'K', 'L'];

const asyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
};

const authenticate = async ({ sheetCells }) => {
  try {
    await doc.useServiceAccountAuth(auth);
    await doc.loadInfo(); // loads document properties and worksheets
    const roster = doc.sheetsById[346544522];
    const sheet = doc.sheetsById[0];

    await roster.loadCells('A1:A30'); // A1 range
    await sheet.loadCells(sheetCells);
    return { sheet, roster };
  } catch (err) {
    return console.error(err);
  }
};

const membersArray = async (sort) => {
  let order;
  console.log(sort);
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
  }

  try {
    const { sheet, roster } = await authenticate({ sheetCells: 'B1:M33' });
    const weekHeader = await sheet.getCellByA1('B1');
    const cloversDB = await db.Member.findAll({ order: [order] });
    const week = getWeek();
    weekHeader.value = `${monthS} ${startWeek.format('D')}th-${endWeek.format('D')}th`;
    const members = [];
    const weekStats = {
      Week: week, cp: [], contribution: [], days: [],
    };

    // Pass names and guilds from DB to object
    Object.values(cloversDB).map((member) => {
      if (JSON.parse(member.guild)[0] === 'CloverHs') {
        members.push({
          name: member.name, guild: JSON.parse(member.guild)[0], discordId: member.discordId, cp: member.cp, gb: member.gb, strikes: member.strikes,
        });
      }
      return '';
    });

    const pushStats = (cells, daysColumns, startIndex) => {
      for (let i = 0; i < 30; i++) {
        const colors = [];

        for (const column of daysColumns) {
          if (daysColumns.indexOf(column) <= 7) {
            const index = daysColumns.indexOf(column);
            const colorObj = cells.getCellByA1(`${column}${i + startIndex}`).backgroundColor;
            const dayCell = cells.getCellByA1(`${column}${i + startIndex}`).formattedValue;
            const statusDay = today.clone().startOf('week');
            const myObj = {};

            statusDay.add(index, 'd');
            statusDay.format('YYYY-MM-DD');
            Object.assign(myObj, colorObj);
            myObj.day = statusDay;
            colors.push(myObj);
          }
        }

        weekStats.days.push(colors);
      }
    };

    pushStats(sheet, strikeColumnsDays, 4);

    switch (week) {
      case 'Week 1':
        console.log('Week 1');
        break;
      case 'Week 2':
        console.log('Week 2');
        break;
      case 'Week 3':
        console.log('Week 3');
        break;
      case 'Week 4':
        console.log('Week 4');
        break;
      default:
        console.log('This week is non-existent');
        break;
    }

    for (const member in members) {
      if (Object.prototype.hasOwnProperty.call(members, member)) {
        members[member].CP = weekStats.cp[member];
        members[member].GB = weekStats.contribution[member];
        members[member].days = weekStats.days[member];
        members[member].strikes = 0;
      }
    }

    const regex = /^(new)/i;
    // const reqs = /^\b([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|10[0-9]{2}|11[0-8][0-9]|119[0-9])\b/gm;

    const filtered = await asyncFilter(members, async (i) => {
      const member = i;
      if (member.name) {
        if (member.CP === '-' || !member.CP) {
          member.CP = '0';
        }

        // if (member.GB.match(reqs)) {
        //   member.strike = true;
        // }

        if (!member.GB || member.GB.match(regex)) {
          member.GB = '0';
        }

        member.CP = parseFloat(parseFloat(member.CP.replace(/,/g, '.')).toFixed(3));
        member.GB = parseInt(member.GB, 10);
        return member;
      }
      return false;
    });

    for await (const member of filtered) {
      // console.log(`Name: ${member.name}/ Discord : ${member.discordId} / CP: ${member.cp}`);
      /* await db.Member.update(
        {
          cp: member.CP,
          gb: member.GB,
          strikes: member.strikes,
        },
        {
          where: {
            discordId: member.discordId,
          },
        },
      ); */
    }
    return { filtered, roster };
  } catch (err) {
    return console.error(err);
  }
};

const updateSheet = async (sort) => {
  try {
    // if starting sunday of week
    const { sheet, roster } = await authenticate({ sheetCells: 'B4:M33' });
    const { filtered } = await membersArray(sort);
    const indexes = [];
    const promises = [];
    const startIndex = 4;

    for (let i = 0; i < 30; i++) {
      indexes.push(i);
    }

    for await (const i of indexes) {
      const member = await sheet.getCellByA1(`B${i + startIndex}`);
      const cp = await sheet.getCellByA1(`J${i + startIndex}`);
      const gb = await sheet.getCellByA1(`K${i + startIndex}`);
      const strikes = await sheet.getCellByA1(`L${i + startIndex}`);
      const discordId = await sheet.getCellByA1(`M${i + startIndex}`);

      member.value = filtered[i].name;
      discordId.value = filtered[i].discordId;
      cp.value = filtered[i].cp;
      gb.value = filtered[i].gb;
      strikes.value = filtered[i].strikes;

      for (const column of strikeColumnsDays) {
        if (strikeColumnsDays.indexOf(column) <= 6) {
          const index = strikeColumnsDays.indexOf(column);
          const info = sheet.getCellByA1(`${column}${i + startIndex}`);
          const day = moment().utc().tz('Europe/Lisbon').day(index);
          info.value = '';
          if (info.backgroundColor.green === 1) {
            info.value = '✔';
          } else if (info.backgroundColor.red === 1) {
            info.value = '✖';
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

module.exports = {
  doc, auth, authenticate, membersArray, dayN, monthN, monthS, getWeek, updateSheet,
};
