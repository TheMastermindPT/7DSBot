module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('members', {
    idMember: {
      autoIncrement: true,
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
    },
    discordId: {
      type: Sequelize.STRING(40),
      allowNull: false,
      field: 'discordId',
    },
    name: {
      type: Sequelize.STRING(45),
      allowNull: false,
      field: 'name',
    },
    guild: {
      type: Sequelize.JSON,
      allowNull: false,
      field: 'guild',
    },
    cp: {
      type: Sequelize.FLOAT,
      allowNull: true,
      field: 'cp',
    },
    gb: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      field: 'gb',
    },
    friendCode: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      field: 'friendCode',
    },
    strikes: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      field: 'strikes',
    },
    indura: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      field: 'indura',
    },
    createdAt: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      field: 'createdAt',
    },
    updatedAt: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      field: 'updatedAt',
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('members'),
};
