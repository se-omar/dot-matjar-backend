/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('orders', {
    order_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    order_number: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    order_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    shipping_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    shipper: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    total_price: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    order_month: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    order_year: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address_line_1: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address_line_2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'orders'
  });
};
