const express = require('express');
const router = express.Router();
const db = require('../database');
const stripe = require('stripe')('sk_test_51H97oICdSDXTIUwz1HsESGMmCODSWE7Ct0hUQ1sRzeSU1rEi0qS5x6n0SYdUmoiXjQeMQAB58xDuvsWp0XjuT2sk00DAVbX0l9')
const bodyParser = require('body-parser');
const cors = require('cors')
const crypto = require('crypto');
const orderid = require('order-id')('mysecret')

router.use(bodyParser.json());
router.use(cors());

router.post('/api/placeOrder', (req, res) => {
    db.users.findOne({
        where: {
            user_id: req.body.user_id
        }
    }).then(user => {
        db.orders.create({
            user_id: user.user_id,
            total_price: req.body.total_price,
            status: 'pending',
            order_date: new Date(),
            order_number: orderid.generate()
        }).then(order => {
            console.log(req.body.quantity)
            console.log(orderid.generate())
            req.body.products.forEach((element, index) => {
                db.products_orders.create({
                    order_id: order.order_id,
                    quantity: req.body.quantity[index],
                    product_id: element.product_id
                })
            });

        })
        res.send('order placed sd')
    })
})

module.exports = router;