require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize, Op } = require('sequelize');

const { NODE_ENV, JAWSDB_URL, LOCAL_URL } = process.env;

let sequelize;
if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(JAWSDB_URL);
  console.log('PRODUCTION DB');
} else {
  sequelize = new Sequelize(LOCAL_URL);
  console.log('LOCAL DB');
}

const basename = path.basename(__filename);
const db = {};

fs
  .readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Op = Op;
module.exports = db;
