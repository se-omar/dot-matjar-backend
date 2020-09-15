/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('suppliers_reviews', {
        suppliers_reviews_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        supplier_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        rating: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        review: {
            type: DataTypes.TEXT,
            allowNull: true
        },

    }, {
        tableName: 'suppliers_reviews',

    });
};
