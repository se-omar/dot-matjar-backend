const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer')
const bodyParser = require('body-parser');
const cors = require('cors');
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const path = require('path');
const {
    cart
} = require('../database');

router.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

router.use(cors());


var imagedir = path.join(__dirname.substr(0, __dirname.length - 6), '/allUploads/');
router.use(express.static(imagedir));


var storage2 = multer.diskStorage({
    destination: './allUploads/productImages',
    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now() + '.jpg')
    }
});
const upload2 = multer({
    storage: storage2
});


//===========================================================
//PRODUCTS TABLE
router.post('/api/products', (req, res) => {
    if (!req.body.product_id) {
        db.products.findAll({
            limit: 20
        }).then(products => {
            res.json({
                products: products
            })
        })
    }
    else {
        console.log('entered here')
        db.products.findAll({
            where: {
                product_id: {
                    [Op.gt]: req.body.product_id
                },
            },
            limit: 20
        }).then(products => {
            res.json({
                products: products
            })
        })
    }


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
        },
        {
            model: db.product_categories,
        },
        ]
    }).then(response => {
        if (!response) {
            res.send('no products found for this user')
            return
        }
        res.send(response)
    })
});


//POST METHOD

router.post('/api/product', upload2.array('file', 12), async (req, res, next) => {
    console.log('uploaded file', req.files);
    var cat = db.product_categories.findOne({
        where: {
            category_name: req.body.category_name
        }
    })



    db.products.create({
        product_name: req.body.product_name,
        category_id: cat.category_id,
        product_code: req.body.product_code,
        user_id: req.body.user_id,
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
            } else {
                row.destroy();
                product.destroy();
                res.send("ROW DELETED")
            }
        })

    })

})


router.get('/api/selectCategory', async (req, res) => {
    var cat = await db.product_categories.findAll()
    res.json({
        data: cat
    })

})

router.put('/api/filterProducts', async (req, res) => {
    console.log('product name=======', req.body.product_name)
    console.log('category name=======', req.body.category_name)

    if (!req.body.category_name) {
        if (!req.body.product_id) {
            console.log('product entered')
            db.products.findAll({
                where: {
                    product_name: {
                        [Op.substring]: req.body.product_name
                    }
                },
                limit: 20,
                include: [{
                    model: db.business
                }]
            }).then(products => {
                res.json({
                    data: products,
                    message: 'searched by productName'
                })
            })
        }
        else {
            db.products.findAll({
                where: {
                    product_id: {
                        [Op.gt]: req.body.product_id
                    },
                    product_name: {
                        [Op.substring]: req.body.product_name
                    }
                },
                limit: 20,
                include: [{
                    model: db.business
                }]
            }).then(products => {
                res.json({
                    data: products,
                    message: 'searched by productName'
                })
            })
        }

    } else if (!req.body.product_name) {
        if (!req.body.product_id) {
            console.log('category entered')
            var cat = await db.product_categories.findOne({
                where: {
                    category_name: req.body.category_name
                }
            })
            db.products.findAll({
                where: {
                    category_id: cat.category_id
                },
                limit: 20,
                include: [{
                    model: db.business
                }]
            }).then(products => {
                res.json({
                    data: products,
                    message: 'searched by category'
                })
                console.log(products.length)
            })
        }
        else {
            console.log('category entered')
            var cat = await db.product_categories.findOne({
                where: {
                    category_name: req.body.category_name
                }
            })
            db.products.findAll({
                where: {
                    product_id: {
                        [Op.gt]: req.body.product_id
                    },
                    category_id: cat.category_id
                },
                limit: 20,
                include: [{
                    model: db.business
                }]
            }).then(products => {
                res.json({
                    data: products,
                    message: 'searched by category'
                })
                console.log(products.length)
            })
        }

    } else {
        if (!req.body.product_id) {
            var cat = await db.product_categories.findOne({
                where: {
                    category_name: req.body.category_name
                }
            })
            var products = await db.products.findAll({
                where: {
                    category_id: cat.category_id,
                    product_name: req.body.product_name
                },
                limit: 20,
                include: [{
                    model: db.business
                }]
            })
            res.json({
                data: products,
                message: 'searched by both'
            })
        }
        else {

            var cat = await db.product_categories.findOne({
                where: {
                    category_name: req.body.category_name
                }
            })
            var products = await db.products.findAll({
                where: {
                    product_id: {
                        [Op.gt]: req.body.product_id
                    },
                    category_id: cat.category_id,
                    product_name: req.body.product_name
                },
                limit: 20,
                include: [{
                    model: db.business
                }]
            })
            res.json({
                data: products,
                message: 'searched by both'
            })
        }

    }
})



router.put('/api/filterSuppliers', (req, res) => {

    if (!req.body.governorate) {
        console.log('name search')
        db.users.findAll({
            where: {
                user_type: 'business',
                full_arabic_name: {
                    [Op.substring]: req.body.name
                }
            }
        }).then(users => {
            res.json({
                users: users,
            })
        })
    }
    else if (!req.body.name && !req.body.region) {
        console.log('governorate srarch')
        db.users.findAll({
            where: {
                governorate: req.body.governorate
            }
        }).then(users => {
            res.json({ users: users })
        })
    }
    else if (!req.body.region) {
        console.log('name and governorate')
        db.users.findAll({
            where: {
                governorate: req.body.governorate,
                full_arabic_name: {
                    [Op.substring]: req.body.name
                }
            }
        }).then(users => {
            if (!users) { res.json({ message: 'suppliers not found' }) }
            else {
                res.json({ users: users })
            }
        })
    }

    else if (!req.body.name) {
        console.log('location search')
        db.users.findAll({
            where: {
                governorate: req.body.governorate,
                region: req.body.region
            }
        }).then(users => {
            if (!users) { res.json({ message: 'No suppliers found' }) }
            else {
                res.json({
                    users: users
                })
            }
        })
    } else {
        console.log('both search')
        db.users.findAll({
            where: {
                user_type: 'business',
                governorate: req.body.governorate,
                full_arabic_name: {
                    [Op.substring]: req.body.name
                },
                region: req.body.region
            }
        })
            .then(users => {
                if (!users) { res.json({ message: 'No suppliers found' }) }
                else {
                    res.json({
                        users: users
                    })
                }
            })

    }
})



module.exports = router;