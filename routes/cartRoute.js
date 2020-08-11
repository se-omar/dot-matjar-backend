const express = require('express');
const router = express.Router();
const db = require('../database');
const stripe = require('stripe')('sk_test_51H97oICdSDXTIUwz1HsESGMmCODSWE7Ct0hUQ1sRzeSU1rEi0qS5x6n0SYdUmoiXjQeMQAB58xDuvsWp0XjuT2sk00DAVbX0l9')
const bodyParser = require('body-parser');
const cors = require('cors')
const crypto = require('crypto');
router.use(bodyParser.json());
router.use(cors());

const token = crypto.randomBytes(10).toString('hex');


router.post('/api/checkout', (req, res) => {
    var itemsArray = [];

    db.cart.findOne({
        where: {
            user_id: req.body.user_id
        }
    }).then(cart => {
        db.cart_products.findAll({
            where: {
                cart_id: cart.cart_id
            },
            include: [db.products]
        }).then((products) => {
            var map = products.map((e) => { return e.product })

            map.forEach((element, index) => {
                const data = {};
                data.amount = element.unit_price * 100;
                data.name = element.product_name;
                data.currency = 'usd';
                data.quantity = req.body.quantityArray[index];
                itemsArray.push(data);
            })

            stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                success_url: 'http://localhost:8080/successfulPayment/' + token,
                cancel_url: 'https://example.com/cancel',
                line_items: itemsArray,

            }).then((session) => {
                res.json({
                    session_id: session.id,
                    token: token
                })
            });

        })
    })




})

// Cart TABLE =======================

router.post('/api/cart', async (req, res) => {
    var cart = await db.cart.findOne({
        where: {
            user_id: req.body.user_id
        }
    })
    if (!cart) {
        db.cart.create({
            user_id: req.body.user_id,
            cart_activity: 1
        })
    }
    console.log('==========', cart.cart_id)
    db.products.findOne({
        where: {
            product_id: req.body.product_id
        }
    }).then(product => {
        product.update({
            cart_id: cart.cart_id
        })
        console.log(cart.cart_id)

        res.json({
            message: "Done",
        })
    })
})

router.post('/api/table', async (req, res) => {

    var cart = await db.cart.findOne({
        where: {
            user_id: req.body.user_id
        }
    })
    if (!cart) {
        cart = await db.cart.create({
            user_id: req.body.user_id,
            cart_activity: 1
        })
    }
    db.products.findOne({
        where: {
            product_id: req.body.product_id
        }
    }).then((product) => { product.update({ in_cart: 1 }) })


    db.cart_products.findOne({
        where: {
            product_id: req.body.product_id,
            cart_id: cart.cart_id
        }
    }).then((product) => {
        console.log('product======', product)
        if (!product) {
            db.cart_products.create({

                cart_id: cart.cart_id,
                product_id: req.body.product_id

            })


        }
        else {
            res.json({ message: "product exists" })
        }
    })


})

router.put('/api/getProducts', (req, res) => {
    db.cart.findOne({
        where: {
            user_id: req.body.user_id
        }
    }).then(cart => {
        db.cart_products.findAll({
            where: {
                cart_id: cart.cart_id
            },
            include: [db.products]
        }).then((products) => {
            var map = products.map((e) => { return e.product })
            res.json({ data: map })
        })
    })

})

router.put('/api/remove', (req, res) => {
    db.cart_products.findOne({
        where: {
            product_id: req.body.product_id
        }
    }).then((product) => {
        product.destroy()
        res.send("product removed")
    })

})



module.exports = router;