module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    idMember: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
    },
    discordId: {
      type: DataTypes.STRING(40),
      allowNull: false,
      field: 'discordId',
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'name',
    },
    guild: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'guild',
    },
    cp: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'cp',
    },
    gb: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'gb',
    },
    friendCode: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'friendCode',
    },
    strikes: {
      type: DataTypes.INTEGER(11),
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
      foreignKey: 'membersIdMember',
      sourceKey: 'idMember',
    });
  };

  return Member;
};
