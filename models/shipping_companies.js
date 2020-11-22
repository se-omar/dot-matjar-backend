/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('shipping_companies', {
    shipping_companies_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    company_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    company_number: {
      type: DataTypes.INTEGER(15),
      allowNull: true
    },
    company_address1: {
      type: DataTypes.STRING(255),
      allowNull: true,

    },
    company_address2: {
      type: DataTypes.STRING(255),

    },
    company_address3: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    default: {
      type: DataTypes.STRING(15),
      allowNull: true
    }
  }, {
    tableName: 'shipping_companies',

  });
};
