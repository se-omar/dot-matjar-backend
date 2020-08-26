const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

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

router.use(bodyParser.json({ limit: '100mb', extended: true }))
router.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))

router.put('/api/supplierProducts/', (req, res) => {

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

router.put('/api/getSupplier', (req, res) => {
    db.users.findOne({
        where: {
            user_id: req.body.user_id
        }
    }).then(user => {
        if (!user) { res.json({ message: "supplier not found" }) }
        else {
            res.json({ data: user })
        }
    })
})

router.put('/api/getRegions', (req, res) => {
    console.log('asdasdasdas', req.body.governorate)
    var region
    fs.readFile('./countries.json', 'utf8', (err, data) => {
        if (err) {
            res.send('error')
        }
        else {
            var obj = JSON.parse(data);


            for (var i = 0; i < obj.length; i++) {
                if (obj[i].government == req.body.governorate) {
                    region = obj[i].cities
                }
            }
            res.json({ data: region })
        }
    })

})


router.put('/api/getGovernorate', (req, res) => {
    var governorate = []
    fs.readFile('./countries.json', 'utf8', (err, data) => {
        if (err) {
            res.send('error')
        }
        else {
            var obj = JSON.parse(data);


            for (var i = 0; i < obj.length; i++) {

                governorate.push(obj[i].government)

            }
            res.json({ data: governorate })
        }
    })

})

router.post('/api/loadMoreSuppliersWithFilter', (req, res) => {

    if (!req.body.governorate) {
        console.log('name search')
        db.users.findAll({
            where: {
                user_id: {
                    [Op.gt]: req.body.user_id
                },
                user_type: 'business',
                full_arabic_name: {
                    [Op.substring]: req.body.name
                }
            },
            limit: 10
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
                user_id: {
                    [Op.gt]: req.body.user_id
                },
                governorate: req.body.governorate
            },
            limit: 10
        }).then(users => {
            res.json({ users: users })
        })
    }
    else if (!req.body.region) {
        console.log('name and governorate')
        db.users.findAll({
            where: {
                user_id: {
                    [Op.gt]: req.body.user_id
                },
                governorate: req.body.governorate,
                full_arabic_name: {
                    [Op.substring]: req.body.name
                }
            },
            limit: 10
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
                user_id: {
                    [Op.gt]: req.body.user_id
                },
                governorate: req.body.governorate,
                region: req.body.region
            },
            limit: 10
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
                user_id: {
                    [Op.gt]: req.body.user_id
                },
                user_type: 'business',
                governorate: req.body.governorate,
                full_arabic_name: {
                    [Op.substring]: req.body.name
                },
                region: req.body.region
            },
            limit: 10
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