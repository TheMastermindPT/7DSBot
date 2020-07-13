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
let sheetIndex;

for (const [monthNumber, index] of Object.entries(monthIndex)) {
  if (monthNumber === month) {
    sheetIndex = index;
  }
}

async function authenticate() {
  try {
    await doc.useServiceAccountAuth(auth);
    await doc.loadInfo(); // loads document properties and worksheets
    const roster = await doc.sheetsById[346544522];
    const sheet = await doc.sheetsByIndex[sheetIndex];
    return { roster, sheet };
  } catch (err) {
    console.error(err);
    return err;
  }
}

module.exports = {
  doc, auth, authenticate, day, month, monthName,
};
