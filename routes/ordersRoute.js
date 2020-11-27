const express = require('express');
const router = express.Router();
const db = require('../database');
//const stripe = require('stripe')('sk_test_51H97oICdSDXTIUwz1HsESGMmCODSWE7Ct0hUQ1sRzeSU1rEi0qS5x6n0SYdUmoiXjQeMQAB58xDuvsWp0XjuT2sk00DAVbX0l9')
const bodyParser = require('body-parser');
const cors = require('cors')
const crypto = require('crypto');
const orderid = require('order-id')('mysecret')
var date = new Date()


router.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

router.use(cors());


router.put('/api/getUserOrders', (req, res) => {
    db.orders.findAll({
        where: {
            user_id: req.body.user_id
        },
        include: [{ model: db.products_orders }]
    }).then(orders => {
        res.json({
            data: orders
        })
    }).catch(err => {
        console.log(err)
    })
})



router.put('/api/getOrderProducts', (req, res) => {
    db.products_orders.findAll({
        where: {
            order_id: req.body.order_id
        },
        include: [{
            model: db.products
        }]
    }).then(orders => {
        res.send(orders)
    })

})

router.put('/api/showOrderProducts', async (req, res) => {
    var order = await db.orders.findOne({
        where: {
            order_number: req.body.order_number
        }
    })
    db.products_orders.findAll({
        where: {
            order_id: order.order_id
        },
        include: [
            { model: db.products }
        ]
    }).then(products => {
        res.json({
            data: products
        })
    })
})

router.post('/api/createOrder', async (req, res) => {
    var cart = await db.cart.findOne({
        where: {
            user_id: req.body.user_id
        }
    })
if(!cart){
    var cart = await db.cart.create({
        user_id : req.body.user_id,
        cart_activity : 1
    })
}
    var cartProducts = await db.cart_products.findAll({
        where: {
            cart_id: cart.cart_id
        },
    })

    var order = await db.orders.create({
        user_id: req.body.user_id,
        status: 'pending',
        order_date: new Date(),
        order_number: orderid.generate(),
        order_month: date.getMonth() + 1,
        order_year: date.getFullYear(),
        country: req.body.governorate,
        city: req.body.region,
        address_line_1: req.body.address,
        total_price : req.body.total_price
    })

    for (var i = 0; i < cartProducts.length; i++) {
        await db.products_orders.create({
            order_id: order.order_id,
            user_id: order.user_id,
            product_id: cartProducts[i].product_id,
            purchase_date: new Date(),
            quantity: cartProducts[i].quantity,
            product_color: cartProducts[i].product_color
        })

        var product = await db.products.findByPk(cartProducts[i].product_id);

        product.update({
            buy_counter: product.buy_counter + cartProducts[i].quantity,
            stock_remaining: product.stock_remaining - cartProducts[i].quantity
        })

        var user = await db.users.findByPk(product.user_id)

        await user.update({
            total_revenue: user.total_revenue + (product.unit_price * cartProducts[i].quantity),
            total_sales: user.total_sales + cartProducts[i].quantity
        })
    }

    res.json({ message: 'order created successfully' })
})




router.put('/api/getCategoryItems', async (req, res) => {
    var category = await db.product_categories.findOne({
        where: { category_name: req.body.category_name }
    })
    db.category_items.findAll({
        where: {
            category_id: category.category_id
        }
    }).then(items => {
        res.json({ message: 'items FOUND', data: items })
    })

})


router.put('/api/getOrder' , async(req,res)=>{
    var order;
    var productsInOrder;


    console.log('idddddddddddd',req.body.user_id)
    if (!req.body.order_id){
        
var orders =await  db.orders.findAll({
    where:{
        user_id : req.body.user_id
    }
   
})
   
    order = await db.orders.findOne({
        where:{
            order_id : orders[orders.length-1].order_id
        }
        
    })
    productsInOrder = await db.products_orders.findAll({
        where:{
            order_id : order.order_id
        },
        include:[{model:db.products}]
    })
 

    }
    else if(req.body.order_id){
order = await db.orders.findOne({
    where:{
        order_id : req.body.order_id
    }
})
productsInOrder = await db.products_orders.findAll({
    where:{
        order_id : order.order_id
    },
    include:[{model:db.products}]
})

    }
res.json({order :order, productsInOrder : productsInOrder , message:'Order Found'})
})



module.exports = router;