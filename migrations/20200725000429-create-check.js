module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('checks', {
    idCheck: {
      autoIncrement: true,
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
    },
    membersIdMember: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: {
          tableName: 'members',
        },
        key: 'idMembers',
      },
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      field: 'date',
    },
    status: {
      type: Sequelize.JSON,
      allowNull: false,
      field: 'status',
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable('checks'),
};
