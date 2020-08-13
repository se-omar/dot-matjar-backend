const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer')
const bodyParser = require('body-parser');
const cors = require('cors')
const path = require("path")

router.use(bodyParser.json());
router.use(cors());


var imagedir = path.join(__dirname.substr(0, __dirname.length - 6), '/allUploads/');
router.use(express.static(imagedir));


var storage2 = multer.diskStorage({
    destination: '../allUploads/productImages',
    filename: function (req, file, cb) {
        cb(null, 'Image-' + Date.now() + ".jpg");
    }
});
const upload2 = multer({
    storage: storage2
});


//===========================================================
//PRODUCTS TABLE
router.get('/api/products', (req, res) => {
    db.products.findAll({
        include: [{
            model: db.business,
            include: [{
                model: db.users
            }]
        }]
    }).then((data) => {
        res.send(data);
    })



});

router.post('/api/myProducts', (req, res) => {
    db.products.findAll({
        where: {
            user_id: req.body.user_id
        },
        include: [{
            model: db.business,
            include: [{
                model: db.users
            }]
        }]
    }).then(response => {
        if (!response) {
            res.send('no products found for this user')
            return
        } else {
            res.send(response)
        }
    })
});


//POST METHOD

router.post('/api/product', upload2.array('file', 12), (req, res, next) => {
    console.log('uploaded file', req.files);

    db.products.create({
        product_name: req.body.product_name,
        product_code: req.body.product_code,
        user_id: req.body.user_id,
        bussiness_id: req.body.bussiness_id,
        HS_code: req.body.HS_code,
        min_units_per_order: req.body.min_units_per_order,
        unit_price: req.body.unit_price,
        size: req.body.size,
        color: req.body.color,
        describtion: req.body.describtion,
        unit_weight: req.body.unit_weight,
        has_discount: req.body.has_discount,
        discount_amount: req.body.discount_amount,
        availability: req.body.availability,
        product_rating: req.body.product_rating,
        main_picture: req.files[0] ? req.files[0].path.substr(11) : null,
        extra_picture1: req.files[1] ? req.files[1].path.substr(11) : null,
        extra_picture2: req.files[2] ? req.files[2].path.substr(11) : null,

    }).then(response => {

        res.send(response)
    })

});

router.post('/api/updateProduct', upload2.array('file', 12), (req, res, next) => {
    console.log('uploaded file', req.files);
    db.products.findOne({
        where: {
            product_id: req.body.product_id
        }
    }).then(product => {
        if (product) {
            product.update({
                product_name: req.body.product_name,
                product_code: req.body.product_code,
                user_id: req.body.user_id,
                bussiness_id: req.body.bussiness_id,
                HS_code: req.body.HS_code,
                min_units_per_order: req.body.min_units_per_order,
                unit_price: req.body.unit_price,
                size: req.body.size,
                color: req.body.color,
                describtion: req.body.describtion,
                unit_weight: req.body.unit_weight,
                has_discount: req.body.has_discount,
                discount_amount: req.body.discount_amount,
                availability: req.body.availability,
                product_rating: req.body.product_rating,
                main_picture: req.files[0] ? req.files[0].path.substr(11) : product.main_picture,
                extra_picture1: req.files[1] ? req.files[1].path.substr(11) : product.extra_picture1,
                extra_picture2: req.files[2] ? req.files[2].path.substr(11) : product.extra_picture2,
            }).then(response => {
                res.send(response)
            })
        } else {
            res.send('cant find product')
        }
    })
})

router.delete('/api/removeProduct/:product_id', (req, res) => {
    db.products.findOne({
        where: {
            product_id: req.params.product_id
        }
    }).then(product => {
        db.cart_products.findOne({
            where: {
                product_id: product.product_id
            }
        }).then(row => {
            if (!row) {
                product.destroy();
                res.send("ROW DELETED")
            }
            else {
                row.destroy();
                product.destroy();
                res.send("ROW DELETED")
            }
        })

    })

})



module.exports = router;