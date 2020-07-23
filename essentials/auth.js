const Discord = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
// spreadsheet key is the long id in the sheets URL
const doc = new GoogleSpreadsheet('1D46g29_u7-uLC23zCOH3YO8cwUkmWmJaRVKr2cGt8Zg');
const moment = require('moment');
const auth = require('../configs/client_secret.json');

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
const mergedColumns = [...strikeColumnsDays, ...strikeColumnsPoints];

const asyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
};

const authenticate = async ({ sheetCells }) => {
  try {
    await doc.useServiceAccountAuth(auth);
    await doc.loadInfo(); // loads document properties and worksheets
    const roster = await doc.sheetsById[346544522];
    const sheet = await doc.sheetsById[0];

    await roster.loadCells('A1:A30'); // A1 range
    await sheet.loadCells(sheetCells);
    return { sheet, roster };
  } catch (err) {
    return console.error(err);
  }
};

const membersArray = async ({ sheetCells }) => {
  try {
    const { sheet, roster } = await authenticate({ sheetCells });
    const members = [];
    const weekHeader = await sheet.getCellByA1('B1');
    const week = getWeek();
    weekHeader.value = `${monthS} ${startWeek.format('D')}th-${endWeek.format('D')}th`;

    const weekStats = {
      Week: week, cp: [], contribution: [], days: [],
    };

    const pushStats = (cells, cpColumn, gbColumn, daysColumns, startIndex) => {
      for (let i = 0; i < 30; i++) {
        weekStats.cp.push(cells.getCellByA1(`${cpColumn}${i + startIndex}`).formattedValue);
        weekStats.contribution.push(cells.getCellByA1(`${gbColumn}${i + startIndex}`).formattedValue);
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

    // Push members and their respective data
    // for (let i = 0; i < 30; i++) {
    //   members.push({ name: roster.getCellByA1(`A${i + 1}`).formattedValue });
    // }
    pushStats(sheet, 'J', 'K', strikeColumnsDays, 4);
    //

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
        members[member].guild = 'CloverHs';
      }
    }

    const regex = /^new/gim;
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

        member.CP = parseFloat(parseFloat(member.CP.replace(/,/g, '.')).toFixed(1));
        member.GB = parseInt(member.GB, 10);
        return member;
      }
      return false;
    });

    await sheet.saveUpdatedCells();
    return { filtered };
  } catch (err) {
    console.error(err);
    return err;
  }
};

/* const clearData = async (startIndex) => {
  // if starting sunday of week
  const { sheet, roster } = await authenticate({ sheetCells: 'B4:L33' });

  const indexes = [];
  const promises = [];

  for (let i = 0; i < 30; i++) {
    indexes.push(i);
  }

  for await (const i of indexes) {
    const member = roster.getCellByA1(`A${i + 1}`);
    member.value = '';
    for (const column of mergedColumns) {
      if (mergedColumns.indexOf(column) <= 9) {
        const done = new Promise((resolve, reject) => {
          const info = sheet.getCellByA1(`${column}${i + startIndex}`);
          info.value = '';
          if (info.backgroundColor.red === 1 || info.backgroundColor.green === 1) {
            resolve(info);
          } else {
            resolve(false);
          }
        });
        promises.push(done);
      }
    }
  }

  await Promise.all(promises);

  const checkIns = await asyncFilter(promises, async (promise) => {
    if (promise) return promise;
    return new Error('This is not a valid checkIn color');
  });

  for await (const status of checkIns) {
    status.backgroundColor = { red: 0.7882353, green: 0.85490197, blue: 0.972549 };
    await status.save();
  }

  await roster.saveUpdatedCells();
};

clearData(4); */

module.exports = {
  doc, auth, authenticate, membersArray, dayN, monthN, monthS, getWeek,
};
