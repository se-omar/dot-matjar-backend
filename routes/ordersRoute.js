const express = require('express');
const router = express.Router();
const db = require('../database');
const stripe = require('stripe')('sk_test_51H97oICdSDXTIUwz1HsESGMmCODSWE7Ct0hUQ1sRzeSU1rEi0qS5x6n0SYdUmoiXjQeMQAB58xDuvsWp0XjuT2sk00DAVbX0l9')
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
    var products = req.body.cartItems
    console.log('quantityy', products)

    var order = await db.orders.create({
        user_id: req.body.user_id,
        status: 'pending',
        order_date: new Date(),
        order_number: orderid.generate(),
        order_month: date.getMonth() + 1,
        order_year: date.getFullYear(),
        total_price: req.body.totalPrice,
        country: req.body.governorate,
        city: req.body.region,
        address_line_1: req.body.address,
    })






    products.forEach(async (element, index) => {

        await db.products_orders.create({
            order_id: order.order_id,
            product_id: element.product_id,
            purchase_date: new Date(),
            quantity: element.quantity
        })

        db.products.findOne({
            where: {
                product_id: element.product_id
            }
        }).then(product => {
            if (!product) {
                return res.send('product not found')
            }

            product.update({
                buy_counter: product.buy_counter + quantityArray[index]
            })

            db.users.findOne({
                where: {
                    user_id: product.user_id
                }
            }).then(user => {
                user.update({
                    total_revenue: user.total_revenue + (product.unit_price * quantityArray[index]),
                    total_sales: user.total_sales + element.quantity[index]
                })
            })
        })

    })
    res.json({ message: 'order created successfully' })
    console.log('Data comming from frontend', req.body.cartItems, req.body.address, req.body.totalPrice, req.body.governorate, req.body.region)
})
module.exports = router;