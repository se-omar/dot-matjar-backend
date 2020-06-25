/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('product_categories', {
    category_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true
    },
    category_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    descripton: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    picture: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    has_products: {
      type: "BINARY(1)",
      allowNull: true
    }
  }, {
    tableName: 'product_categories',
    timestamps: false
  });
};