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
    var quantities = req.body.productsQuantities
    var cart = await db.cart.findOne({
        where: {
            user_id: req.body.user_id
        }
    })

    var cartProducts = await db.cart_products.findAll({
        where: {
            cart_id: cart.cart_id
        },
    })

    for (var k = 0; k < cartProducts.length; k++) {
        await db.cart_products.update({
            quantity: quantities[k]
        }, {
            where: {
                cart_products_id: cartProducts[k].cart_products_id
            }
        })
    }

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
    })

    for (var i = 0; i < cartProducts.length; i++) {
        await db.products_orders.create({
            order_id: order.order_id,
            user_id: order.user_id,
            product_id: cartProducts[i].product_id,
            purchase_date: new Date(),
            quantity: quantities[i],
            product_color: cartProducts[i].product_color
        })

        var product = await db.products.findByPk(cartProducts[i].product_id);

        product.update({
            buy_counter: product.buy_counter + quantities[i],
            stock_remaining: product.stock_remaining - quantities[i]
        })

        var user = await db.users.findByPk(product.user_id)

        await user.update({
            total_revenue: user.total_revenue + (product.unit_price * quantities[i]),
            total_sales: user.total_sales + quantities[i]
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






module.exports = router;