const Seq = require('sequelize').Sequelize;
const sequelize = new Seq('ecommerce-27-september', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        timestamps: false,
        underscored: true
    },

});
const db = {
    sequelize: sequelize,
    users: sequelize.import('./models/users'),
    products: sequelize.import('./models/products'),
    business: sequelize.import('./models/bussiness'),
    product_categories: sequelize.import('./models/product_categories'),
    requests: sequelize.import('./models/requests'),
    cart: sequelize.import('./models/cart'),
    cart_products: sequelize.import('./models/cart_products'),
    orders: sequelize.import('./models/orders'),
    products_orders: sequelize.import('./models/products_orders'),
    supplier_page_info: sequelize.import('./models/supplier_page_info'),
    products_reviews: sequelize.import('./models/products_reviews.js'),
    category_items: sequelize.import('./models/category_items'),
    suppliers_reviews: sequelize.import('./models/suppliers_reviews.js'),
    categories_request: sequelize.import('./models/categories_request.js')
}

db.users.hasMany(db.requests, {
    as: 'recievedRequests',
    foreignKey: 'to_user_id'
});
db.users.hasMany(db.requests, {
    as: 'sentRequests',
    foreignKey: 'by_user_id'
});
db.requests.belongsTo(db.users, {
    as: 'recievingUser',
    foreignKey: 'to_user_id'
});
db.requests.belongsTo(db.users, {
    as: 'sendingUser',
    foreignKey: 'by_user_id'
});

db.products.hasMany(db.requests, {
    foreignKey: 'product_id',
});
db.requests.belongsTo(db.products, {
    foreignKey: 'product_id',
})


db.users.hasOne(db.business, {
    foreignKey: 'user_id'
});
db.business.belongsTo(db.users, {
    foreignKey: 'user_id'
});
// db.business.hasOne(db.users, {
//     foreignKey: 'user_id'
// });

db.business.hasMany(db.products, {
    foreignKey: 'bussiness_id'
});
db.products.belongsTo(db.business, {
    foreignKey: 'bussiness_id'
});

db.users.hasMany(db.products, {
    foreignKey: 'user_id'
});
db.products.belongsTo(db.users, {
    foreignKey: 'user_id'
});

db.product_categories.hasMany(db.products, {
    foreignKey: 'category_id'
});
db.products.belongsTo(db.product_categories, {
    foreignKey: 'category_id'
});
db.cart.hasMany(db.products, {
    foreignKey: 'cart_id'
})
db.cart.hasOne(db.users, {
    foreignKey: 'cart_id'
})
db.products.belongsTo(db.cart, {
    foreignKey: 'cart_id'
})
db.users.belongsTo(db.cart, {
    foreignKey: 'cart_id'
})



db.cart.belongsToMany(db.products, {
    through: 'cart_products',
    foreignKey: 'cart_id'
});
db.products.belongsToMany(db.cart, {
    through: 'cart_products',
    foreignKey: 'product_id'
});
db.cart.hasMany(db.cart_products, {
    foreignKey: 'cart_id'
});
db.cart_products.belongsTo(db.cart, {
    foreignKey: 'cart_id'
});
db.products.hasMany(db.cart_products, {
    foreignKey: 'product_id'
}, {
    onDelete: 'cascade'
});
db.cart_products.belongsTo(db.products, {
    foreignKey: 'product_id'
});



db.orders.belongsToMany(db.products, {
    through: 'products_orders',
    foreignKey: 'order_id'
});
db.products.belongsToMany(db.orders, {
    through: 'products_orders',
    foreignKey: 'product_id'
});
db.orders.hasMany(db.products_orders, {
    foreignKey: 'order_id'
});
db.products_orders.belongsTo(db.orders, {
    foreignKey: 'order_id'
});
db.products.hasMany(db.products_orders, {
    foreignKey: 'product_id'
}, {
    onDelete: 'cascade'
});
db.products_orders.belongsTo(db.products, {
    foreignKey: 'product_id'
});




db.users.hasMany(db.orders, {
    foreignKey: 'user_id'
},
    {
        onDelete: 'cascade'
    }
)
db.orders.belongsTo(db.users, {
    foreignKey: 'user_id'
})





db.users.belongsToMany(db.products, {
    through: 'products_reviews',
    foreignKey: 'user_id'
});
db.products.belongsToMany(db.users, {
    through: 'products_reviews',
    foreignKey: 'product_id'
});
db.users.hasMany(db.products_reviews, {
    foreignKey: 'user_id'
});
db.products_reviews.belongsTo(db.users, {
    foreignKey: 'user_id'
});
db.products.hasMany(db.products_reviews, {
    foreignKey: 'product_id'
});
db.products_reviews.belongsTo(db.products, {
    foreignKey: 'product_id'
});


db.product_categories.hasMany(db.category_items, {
    foreignKey: 'category_id'
})

db.category_items.belongsTo(db.product_categories, {
    foreignKey: 'category_id'
})
db.users.hasMany(db.suppliers_reviews, {
    as: 'user',
    foreignKey: 'user_id'
});
db.users.hasMany(db.suppliers_reviews, {
    as: 'supplier',
    foreignKey: 'supplier_id'
});
db.suppliers_reviews.belongsTo(db.users, {
    as: 'user',
    foreignKey: 'user_id'
});
db.suppliers_reviews.belongsTo(db.users, {
    as: 'supplier',
    foreignKey: 'supplier_id'
});

db.category_items.hasMany(db.products, {
    foreignKey: 'category_items_id'
})
db.products.belongsTo(db.category_items, {
    foreignKey: 'category_items_id'
})



db.users.hasMany(db.categories_request, {
    foreignKey: 'user_id'
})
db.categories_request.belongsTo(db.users, {
    foreignKey: 'user_id'
})




// db.users.hasOne(db.supplier_page_info)

module.exports = db;