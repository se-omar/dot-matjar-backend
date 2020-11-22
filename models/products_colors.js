/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('products_colors', {
        Id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        product_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },

        color: {
            type: DataTypes.STRING(255),
            allowNull: true,
        }
    }, {
        tableName: 'products_colors',
    });
};
