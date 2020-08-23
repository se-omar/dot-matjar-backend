/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('requests', {
    requests_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    by_user_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    to_user_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    request_number: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    product_id: {
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
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'requests',

  });
};
