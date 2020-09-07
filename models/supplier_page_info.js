/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('supplier_page_info', {
    page_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    site_name: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    facebook: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    linkedin: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    instgram: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    twitter: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    footer: {
      type: DataTypes.TEXT,
      allowNull: true

    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true

    },
    google: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    carousel_width: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    carousel_height: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
  }, {
    tableName: 'supplier_page_info',
    timestamps: false
  });
};
