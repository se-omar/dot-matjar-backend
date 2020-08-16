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
    }
  }, {
    tableName: 'orders'
  });
};
