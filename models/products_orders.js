/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('products_orders', {
    products_orders_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    order_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    tableName: 'products_orders'
  });
};
