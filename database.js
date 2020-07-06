const Seq = require('sequelize').Sequelize;
const sequelize = new Seq('project', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});
const db = {
    users: sequelize.import('./models/users'),
    products: sequelize.import('./models/products'),
    business: sequelize.import('./models/business'),
    product_categories: sequelize.import('./models/product_categories'),
    requests: sequelize.import('./models/requests')
}
db.users.hasMany(db.requests, {
    foreignKey: 'user_id'
});
db.requests.hasOne(db.users, {
    foreignKey: 'user_id'
});
db.users.hasOne(db.business, {
    foreignKey: 'user_id'
});
db.business.hasOne(db.users, {
    foreignKey: 'user_id'
});

db.business.hasMany(db.products, {
    foreignKey: 'bussiness_id'
});
db.products.hasOne(db.business, {
    foreignKey: 'bussiness_id'
});
db.product_categories.hasMany(db.products, {
    foreignKey: 'category_id'
});
db.products.hasMany(db.product_categories, {
    foreignKey: 'category_id'
});


module.exports = db;