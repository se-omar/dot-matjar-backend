

module.exports = function(sequelize,DataTypes){
return sequelize.define('shipping_rate',{
    rate_id:{
        type: DataTypes.INTEGER(11),
        allowNull : false,
        primaryKey: true,
        autoIncrement: true
    },
    shipping_rate:{
        type: DataTypes.INTEGER(11),
        allowNull:true
    },
    country :{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    governorate:{
        type: DataTypes.STRING(255),
        allowNull:true
    },
    shipping_companies_id:{
        type: DataTypes.INTEGER(11),
        allowNull:true
    }

},
{
    tableName: 'shipping_rate',

  })
  
}