/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "suppliers_categories_closure",
    {
      Id: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      supplier_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      parent_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      category_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      category_arabic_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "suppliers_categories_closure",
    }
  );
};
