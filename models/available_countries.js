/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('available_countries', {
        country_id: {
            type: DataTypes.INTEGER(10),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        country_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

    }, {
        tableName: 'available_countries',

    });
};
