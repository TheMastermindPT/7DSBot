module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('polls', {
    idPolls: {
      autoIncrement: true,
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    membersIdMember: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: {
          tableName: 'members',
        },
        key: 'idMember',
      },
    },
    answers: {
      type: Sequelize.JSON,
      allowNull: false,
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable('polls'),
};
