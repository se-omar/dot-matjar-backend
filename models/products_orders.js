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
      references: {
        model: 'products',
        key: 'product_id'
      }
    },
    order_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'orders',
        key: 'order_id'
      }
    },
    user_id: {
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
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'products_orders'
  });
};