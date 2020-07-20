/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const Member = sequelize.define('Member', {
    idMembers: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'name',
    },
    guild: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'guild',
    },
    cp: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'cp',
    },
    gb: {
      type: DataTypes.INTEGER(5),
      allowNull: true,
      field: 'gb',
    },
    strikes: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      field: 'strikes',
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
    tableName: 'members',
  });

  Member.associate = function (models) {
    Member.hasMany(models.Check, {
      foreignKey: 'membersIdMembers',
      sourceKey: 'idMembers',
    });
  };

  return Member;
};
