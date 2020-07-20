/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('requests', {
    requests_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: '0',
      primaryKey: true
    },
    by_user_id: {
      type: DataTypes.INTEGER(10),

    },
    to_user_id: {
      type: DataTypes.INTEGER(10),

    },
    product_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },

    request_response: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    request_numberr: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    request_status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    request_details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    request_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    tableName: 'requests',
    timestamps: false
  });
};