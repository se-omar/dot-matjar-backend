/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('courses', {
    course_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    author_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      references: {
        model: 'authors_tutors',
        key: 'author_id'
      }
    },
    subject_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'subjects',
        key: 'subject_id'
      }
    },
    course_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    course_description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'courses',
    timestamps: false
  });
};