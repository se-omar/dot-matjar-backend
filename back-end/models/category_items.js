/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('category_items', {
        category_items_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            references: {
                model: 'product_categories',
                key: 'category_id'
            }
        },
        category_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        category_items: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        category_arabic_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        category_items_arabic_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
    }, {
        tableName: 'category_items',
    });
};
