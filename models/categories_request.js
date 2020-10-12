/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('categories_request', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        request_type: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            references: {
                model: 'user_id',
                key: 'user_id'
            }
        },
        new_category_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        new_category_item: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        new_category_description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        new_item_description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        new_item_category_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(255),
            allowNull: false,

        }
    }, {
        tableName: 'categories_request',
    });
};
