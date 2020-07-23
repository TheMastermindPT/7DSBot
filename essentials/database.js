const { Sequelize } = require('sequelize');
const { Check, Member } = require('../models');

const sequelize = new Sequelize('7dsbot', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  port: 8889,
  // logging: console.log(''),
});
console.log('Local DB');

global.db = {
  Sequelize,
  sequelize,
  Member,
  Check,
};

module.exports = { sequelize, global: global.db };
