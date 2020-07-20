const Discord = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
// spreadsheet key is the long id in the sheets URL
const doc = new GoogleSpreadsheet('1NlFFA9XUAkGCyID9B5cyjdb2FXmmUOiEzlaPWhqzrSo');
const async = require('async');
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

const asyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
};

const authenticate = async function () {
  try {
    await doc.useServiceAccountAuth(auth);
    await doc.loadInfo(); // loads document properties and worksheets
    const roster = await doc.sheetsById[346544522];
    const sheet = await doc.sheetsById[0];

    await roster.loadCells('A1:A30'); // A1 range
    await sheet.loadCells('B1:L33');

    const members = [];
    const weekHeader = await sheet.getCellByA1('B1');
    const week = getWeek();
    weekHeader.value = week;

    const weekStats = {
      Week: week, cp: [], contribution: [], days: [],
    };

    const strikeColumns1 = ['C', 'D', 'E', 'F', 'G', 'H', 'I'];

    const pushStats = (cells, cpColumn, gbColumn, strikeColumns, startIndex) => {
      for (let i = 0; i < 30; i++) {
        weekStats.cp.push(cells.getCellByA1(`${cpColumn}${i + startIndex}`).formattedValue);
        weekStats.contribution.push(cells.getCellByA1(`${gbColumn}${i + startIndex}`).formattedValue);
        const colors = [];

        for (const column of strikeColumns) {
          if (strikeColumns.indexOf(column) <= 7) {
            const index = strikeColumns.indexOf(column);
            const colorObj = cells.getCellByA1(`${column}${i + startIndex}`).backgroundColor;
            const dayCell = cells.getCellByA1(`${column}${i + startIndex}`).formattedValue;
            const invertedIndex = 6 - index;

            const statusDay = new Date();
            statusDay.setDate(statusDay.getDate() - invertedIndex);

            const myObj = {};
            Object.assign(myObj, colorObj);
            myObj.day = statusDay;
            colors.push(myObj);
          }
        }

        weekStats.days.push(colors);
      }
    };

    // Push members and their respective data
    for (let i = 0; i < 30; i++) {
      members.push({ name: roster.getCellByA1(`A${i + 1}`).formattedValue });
    }
    pushStats(sheet, 'J', 'K', strikeColumns1, 4);
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
      members[member].CP = weekStats.cp[member];
      members[member].GB = weekStats.contribution[member];
      members[member].days = weekStats.days[member];
      members[member].strikes = 0;
      members[member].guild = 'Clover-HS';
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

        if (member.GB.match(regex)) {
          member.GB = '0';
        }

        member.CP = parseFloat(parseFloat(member.CP.replace(/,/g, '.')).toFixed(1));
        member.GB = parseInt(member.GB, 10);
        return member;
      }
      return false;
    });
    return { roster, sheet, filtered };
  } catch (err) {
    console.error(err);
    return err;
  }
};

module.exports = {
  doc, auth, authenticate, dayN, monthN, monthS, getWeek,
};
