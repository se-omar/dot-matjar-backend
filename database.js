const Seq = require('sequelize').Sequelize;
const sequelize = new Seq('ecommercedb', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});
module.exports = {
    users: sequelize.import('./models/users'),
    products: sequelize.import('./models/products'),
    business: sequelize.import('./models/business'),
    product_categories: sequelize.import('./models/product_categories'),
    requests: sequelize.import('./models/requests')
}