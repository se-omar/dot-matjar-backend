/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('supplier_page_info', {
    page_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    site_name: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    facebook: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    linkedin: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    instgram: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    twitter: {
      type: DataTypes.STRING(255),
      allowNull: true

    },
    footer: {
      type: DataTypes.TEXT,
      allowNull: true

    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true

    },
    google: {
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
  }, {
    tableName: 'supplier_page_info',
    timestamps: false
  });
};
