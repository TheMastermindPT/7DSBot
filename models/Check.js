/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const Check = sequelize.define('Check', {
    idCheck: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
    },
    membersIdMember: {
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'date',
    },
    status: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'status',
    },
    createdAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'createdAt',
    },
    updatedAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'updatedAt',
    },
  }, {
    sequelize,
    tableName: 'checks',
  });

  Check.associate = function (models) {
    Check.belongsTo(models.Member, {
      foreignKey: 'membersIdMember',
      targetKey: 'idMember',
    });
  };

  return Check;
};
