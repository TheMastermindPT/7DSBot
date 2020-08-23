module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('images', {
    idimages: {
      autoIncrement: true,
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
    },
    membersidMember: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      references: {
        model: {
          tableName: 'members',
        },
        key: 'idMember',
      },
    },
    url: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('images'),
};
