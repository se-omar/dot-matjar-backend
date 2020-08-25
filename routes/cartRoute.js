const express = require('express');
const router = express.Router();
const db = require('../database');
const stripe = require('stripe')('sk_test_51H97oICdSDXTIUwz1HsESGMmCODSWE7Ct0hUQ1sRzeSU1rEi0qS5x6n0SYdUmoiXjQeMQAB58xDuvsWp0XjuT2sk00DAVbX0l9')
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const orderid = require('order-id')('mysecret')
const endpointSecret = 'whsec_cBcdnKIKvB73t8hltToBCAjZtQWhabds';
var date = new Date();
router.use(cors());

router.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

const token = crypto.randomBytes(10).toString('hex');

var productsArray = [];
var currentUserAtCheckout = '';
var quantityArray = [];
router.post('/api/checkout', (req, res) => {
    var itemsArray = [];
    currentUserAtCheckout = req.body.user_id;
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
            var map = products.map((e) => {
                return e.product
            })

            map.forEach((element, index) => {
                const data = {};
                data.amount = element.unit_price * 100;
                data.name = element.product_name;
                data.currency = 'usd';
                data.quantity = req.body.quantityArray[index];
                quantityArray.push(req.body.quantityArray[index])
                itemsArray.push(data);
                productsArray.push(element);
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

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), (request, response) => {
    const sig = request.headers['stripe-signature'];
    console.log('current user is ', currentUserAtCheckout)
    console.log('entered webhook')

    let event;
    console.log('the request body', request.body)

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        console.log('entered catch', err.message)
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('current user at successful', currentUserAtCheckout);
        db.users.findOne({
            where: {
                user_id: currentUserAtCheckout
            }
        }).then(user => {
            db.orders.create({
                user_id: user.user_id,
                total_price: session.amount_total,
                status: 'pending',
                order_date: new Date(),
                order_number: orderid.generate(),
                order_month: date.getMonth() + 1
            }).then(order => {
                console.log(orderid.generate())
                productsArray.forEach((element, index) => {
                    db.products.findOne({
                        where: {
                            product_id: element.product_id
                        }
                    }).then(product => {
                        if (!product) {
                            return response.send('product not found')
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
                                total_revenue: user.total_revenue + (product.unit_price * quantityArray[index])
                            })
                        })
                    })

                    db.products_orders.create({
                        order_id: order.order_id,
                        quantity: quantityArray[index],
                        product_id: element.product_id,
                        purchase_date: new Date()
                    })
                });

            })
        })
        console.log('session is ', session)
        return response.send(session)
    }
});

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
    }).then((product) => {
        product.update({
            in_cart: 1
        })
    })


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
            res.json({
                message: "product added successfully"
            })

        } else {
            res.json({
                message: "product exists"
            })
        }
    })


})

router.put('/api/getProducts', async (req, res) => {
    var cart = await db.cart.findOne({
        where: {
            user_id: req.body.user_id
        }
    })

    var products = await db.cart_products.findAll({
        where: {
            cart_id: cart.cart_id
        },
        include: [db.products]
    })

    var map = await products.map((e) => {
        return e.product
    })
    res.json({
        data: map,

    })

})



router.put('/api/remove', (req, res) => {
    db.cart_products.findOne({
        where: {
            product_id: req.body.product_id
        }
    }).then(product => {
        product.destroy()
        res.send("product removed")
    })

})

router.put('/api/cleanCart', async (req, res) => {
    var cart = await db.cart.findOne({
        where: {
            user_id: req.body.user_id
        }
    })
    db.cart_products.findAll({
        where: {
            cart_id: cart.cart_id
        }
    }).then((products) => {
        products.map(e => {
            return e.destroy()
        })

        res.json({
            message: "cart cleaned"
        })
    })

})




module.exports = router;