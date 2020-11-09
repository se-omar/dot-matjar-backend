/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('suppliers_items', {
        suppliers_items_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        category_items_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        item_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        item_arabic_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },


    }, {
        tableName: 'suppliers_items',

    });
};