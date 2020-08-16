const express = require('express');
const router = express.Router();
const db = require('../database');
const bodyParser = require('body-parser');
const cors = require('cors');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// sequelize.where(sequelize.fn("month", sequelize.col("fromDate")), fromMonth)
router.post('/api/monthlySales', (req, res) => {
    db.orders.findAll({
        include: [{
            model: db.products, as: 'products',
            where: {
                user_id: req.body.user_id
            }
        }]
    }).then(products => {
        res.send(products)
    })
})

router.post('/api/topSellingProduct', (req, res) => {
    db.products.max('buy_counter', {
        where: {
            user_id: req.body.user_id
        }
    }).then(max => {
        db.products.findOne({
            where: {
                user_id: req.body.user_id,
                buy_counter: max
            },
            include: [{
                model: db.business,
                include: [{
                    model: db.users
                }]
            }]
        }).then(product => {
            res.json({
                maxProduct: product
            })
        })

    })
});

router.post('/api/leastSellingProduct', (req, res) => {
    db.products.min('buy_counter', {
        where: {
            user_id: req.body.user_id
        }
    }).then(min => {
        db.products.findOne({
            where: {
                user_id: req.body.user_id,
                buy_counter: min
            },
            include: [{
                model: db.business,
                include: [{
                    model: db.users
                }]
            }]
        }).then(product => {
            res.json({
                minProduct: product
            })
        })

    })
})

module.exports = router;