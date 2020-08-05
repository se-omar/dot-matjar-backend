/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_categories', {
    category_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    category_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    picture: {
      type: "VARBINARY(255)",
      allowNull: true
    },
    has_products: {
      type: "BINARY(1)",
      allowNull: true
    }
  }, {
    tableName: 'product_categories',
    timestamps:false

  });
};
