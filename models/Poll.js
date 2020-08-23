/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const Poll = sequelize.define('Poll', {
    idpolls: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
    },
    membersidMember: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: {
          tableName: 'members',
        },
        key: 'idMember',
      },
    },
    answers: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  }, {
    sequelize,
    tableName: 'polls',
  });
  return Poll;
};
