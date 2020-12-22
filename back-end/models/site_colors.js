/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('site_colors', {
        id: {
            type: DataTypes.INTEGER(10),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        toolbar_color: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        footer_color: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        footer_text_color: {
            type: DataTypes.INTEGER(10),
            allowNull: true
        },
        button_color: {
            type: DataTypes.INTEGER(10),
            allowNull: true
        },
        button_text_color: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        toolbar_text_color: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        carousel_width: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        carousel_height: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        show_carousel: {
            type: DataTypes.INTEGER(1),
            allowNull: false
        },
        show_left_banner: {
            type: DataTypes.INTEGER(1),
            allowNull: false
        },
        show_right_banner: {
            type: DataTypes.INTEGER(1),
            allowNull: false
        },
        carousel_image_1: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        carousel_image_2: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        carousel_image_3: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        carousel_image_4: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        left_banner_image: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        right_banner_image: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        website_logo: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
    }, {
        tableName: 'site_colors',

    });
};
