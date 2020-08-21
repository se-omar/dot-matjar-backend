const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const {
    cart
} = require('../database');
router.use(bodyParser.json());
router.use(cors());


router.put('/api/supplierProducts', (req, res) => {
    console.log('user id issss', req.body.user_id)
    db.products.findAll({
            where: {
                user_id: req.body.user_id
            },
            include: [{
                model: db.business
            }]
        })
        .then(products => {
            console.log('supplier productsss', products)
            res.json({
                data: products

            })
        })
        .catch(err => {
            console.log(err)
        })
})

router.put('/api/supplierPageColor', (req, res) => {
    console.log('reqqqqqqqqqqqqqq', req.body.user_id, req.body.page_color)
    db.users.findOne({
        where: {
            user_id: req.body.user_id
        }
    }).then(user => {
        if (user.user_type == 'business') {
            if (req.body.page_color) {
                user.update({
                    page_color: req.body.page_color
                })
            }
            res.json({
                message: 'page color updated',
                data: user.page_color
            })

        } else {
            res.json({
                message: 'user is not a suppliers'
            })
        }
    })
})












module.exports = router;