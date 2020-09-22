/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const Image = sequelize.define('Image', {
    idimages: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
    },
    membersIdMember: {
      type: DataTypes.INTEGER(11),
      unique: true,
      allowNull: false,
      references: {
        model: {
          tableName: 'members',
        },
        key: 'idMember',
      },
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    sequelize,
    tableName: 'images',
  });

  Image.associate = function (models) {
    Image.belongsTo(models.Member, {
      foreignKey: 'membersIdMember',
      targetKey: 'idMember',
    });
  };

  return Image;
};
