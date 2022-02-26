/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('bussiness', {
    bussiness_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    bussiness_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    banner: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    number_of_employees: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    hq_governorate: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bussiness_activity: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    enterprice_national_number: {
      type: DataTypes.INTEGER(20),
      allowNull: true
    },
    commercial_register: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tax_card: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    operating_license: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'bussiness',

  });
};