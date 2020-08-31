/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('users', {
    user_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'user'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    profile_photo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    national_number: {
      type: DataTypes.STRING(14),
      allowNull: true
    },
    full_arabic_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    mobile_number: {
      type: DataTypes.INTEGER(15),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    full_english_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    qualification: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    job: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    governorate: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    region: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    center: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    telephone_number: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    phone_number: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    fax: {
      type: DataTypes.INTEGER(15),
      allowNull: true
    },
    facebook_account: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    linkedin: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    crypto: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cart_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
      references: {
        model: 'cart',
        key: 'cart_id'
      }
    },
    page_color: {
      type: DataTypes.STRING(255),
    },
    total_revenue: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    revenue_recieved: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
   site_color: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: 'users',
  });
};