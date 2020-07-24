const { Sequelize } = require('sequelize');
const { Check, Member } = require('../models');

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize('mysql://o5fmnii1vuxn19ff:dxatcw8qntsq4vbh@b8rg15mwxwynuk9q.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/ucp5np6d9w43fcgo');
  console.log('Production DB');
} else {
  sequelize = new Sequelize('7dsbot', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    port: 8889,
    logging: console.log,
  });
  console.log('Local DB');
}

global.db = {
  Sequelize,
  sequelize,
  Member,
  Check,
};

module.exports = { sequelize, global: global.db };
