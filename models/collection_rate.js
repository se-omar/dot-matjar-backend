module.exports =  function(sequelize,DataTypes)  {
return sequelize.define('collection_rate',{
    collection_id:{
        type : DataTypes.INTEGER(11),
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    amount:{
        type : DataTypes.INTEGER(11),
        allowNull:false
    },
    collection_rate:{
        type: DataTypes.INTEGER(11),
        allowNull:false
    },
    shipping_companies_id:{
        type : DataTypes.INTEGER(11),
        allowNull:false
    }
},

{tableName:'collection_rate'})
}