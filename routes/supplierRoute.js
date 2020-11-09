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

router.use(bodyParser.json({
    limit: '100mb',
    extended: true
}))
router.use(bodyParser.urlencoded({
    limit: '100mb',
    extended: true
}))

router.put('/api/supplierProducts/', (req, res) => {

    console.log('user id issss', req.body.user_id)
    db.products.findAll({
            where: {
                user_id: req.body.user_id
            },
            include: [{
                model: db.business
            }, {
                model: db.users
            }, {
                model: db.product_categories
            }]
        })
        .then(products => {

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

        if (req.body.page_color) {
            user.update({
                page_color: req.body.page_color
            })
        }
        res.json({
            message: 'page color updated',
            data: user.page_color
        })


    })
})

router.put('/api/getSupplier', (req, res) => {
    db.users.findOne({
        where: {
            user_id: req.body.user_id
        }
    }).then(user => {
        if (!user) {
            res.json({
                message: "supplier not found"
            })
        } else {
            res.json({
                data: user
            })
        }
    })
})

router.put('/api/getRegions', (req, res) => {

    var region
    fs.readFile('./countries.json', 'utf8', (err, data) => {
        if (err) {
            res.send('error')
        } else {
            var obj = JSON.parse(data);


            for (var i = 0; i < obj.length; i++) {
                if (obj[i].government == req.body.governorate) {
                    region = obj[i].cities
                }
            }
            res.json({
                data: region
            })
        }
    })

})


router.put('/api/getGovernorate', (req, res) => {
    var governorate = []
    fs.readFile('./countries.json', 'utf8', (err, data) => {
        if (err) {
            res.send('error')
        } else {
            var obj = JSON.parse(data);


            for (var i = 0; i < obj.length; i++) {

                governorate.push(obj[i].government)

            }
            res.json({
                data: governorate
            })
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
    } else if (!req.body.name && !req.body.region) {
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
            res.json({
                users: users
            })
        })
    } else if (!req.body.region) {
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
            if (!users) {
                res.json({
                    message: 'suppliers not found'
                })
            } else {
                res.json({
                    users: users
                })
            }
        })
    } else if (!req.body.name) {
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
            if (!users) {
                res.json({
                    message: 'No suppliers found'
                })
            } else {
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
                if (!users) {
                    res.json({
                        message: 'No suppliers found'
                    })
                } else {
                    res.json({
                        users: users
                    })
                }
            })

    }
})

router.put('/api/supplierProductsInOrder', async (req, res) => {
    db.orders.findAll({
        include: [{
                model: db.users
            },
            {
                model: db.products,
                where: {
                    user_id: req.body.user_id
                },

            },
        ]
    }).then(orders => {

        res.json({
            data: orders
        })
    })
})

router.get('/api/getAllSuppliersWithSales', (req, res) => {
    db.users.findAll({
        where: {
            user_type: 'business',
            total_sales: {
                [Op.gt]: 0
            }
        }
    }).then(suppliers => {
        res.json({
            suppliers: suppliers
        })
    })
})

router.post('/api/getSupplierReview', (req, res) => {
    var wh = {}
    if (req.body.user_id) {
        wh.user_id = req.body.user_id
    }
    if (req.body.supplier_id) {
        wh.supplier_id = req.body.supplier_id
    }
    db.suppliers_reviews.findOne({
        where: wh
    }).then(row => {
        if (!row) {
            res.json({
                message: 'no review found',
                review: {
                    rating: 0,
                    review: ''
                }
            })
        } else {
            res.json({
                message: 'review was found',
                review: row
            })
        }
    })
})

router.post('/api/addSupplierReview', (req, res) => {
    db.suppliers_reviews.findOne({
        where: {
            user_id: req.body.user_id,
            supplier_id: req.body.supplier_id
        }
    }).then(row => {
        if (!row) {
            db.suppliers_reviews.create({
                supplier_id: req.body.supplier_id,
                user_id: req.body.user_id,
                rating: req.body.rating,
                review: req.body.review
            }).then(response => {
                res.json({
                    message: 'review placed successfully',
                    review: response
                })
            })
        } else {
            res.json({
                message: 'you already placed a review',
                review: row
            })
        }
    })
})

router.post('/api/getSupplierRatingsArray', (req, res) => {
    db.suppliers_reviews.findAll({
        where: {
            supplier_id: req.body.supplier_id
        },
        include: [{
            model: db.users,
            as: 'supplier'
        }, {
            model: db.users,
            as: 'user'
        }]
    }).then(rows => {
        res.json({
            rows: rows
        })
    })
})

router.post('/api/calculateSupplierRating', (req, res) => {
    db.suppliers_reviews.findAll({
        where: {
            supplier_id: req.body.supplier_id
        }
    }).then(rows => {
        var rating = 0;
        var counter = 0;
        var average = 0;
        rows.forEach(element => {
            rating += element.rating
            counter++
        });
        average = rating / counter;
        db.users.findByPk(req.body.supplier_id).then(user => {
            user.update({
                rating: average,
                rate_counter: counter
            })
        })
        res.json({
            message: 'rating placed in product'
        })
    })
})



router.put('/api/getPendingSuppliers', (req, res) => {
    db.users.findAll({
        where: {
            user_type: "waiting_approval"
        }
    }).then(users => {
        res.json({
            message: "users FOUND",
            data: users
        })
    })
})

router.put('/api/acceptSupplierRequest', async (req, res) => {
    var id = req.body.user_id.user_id
    console.log('id', id)
    // db.users.findOne({
    //     where: {
    //         user_id: req.body.user_id
    //     }
    // }).then(async user => {
    //     await user.update({
    //         user_type: 'business'
    //     })
    //     res.json({ message: 'Request Accepted' })
    // })
    db.users.findOne({
        where: {
            user_id: req.body.user_id.user_id
        }
    }).then(user => {
        if (!user) {
            console.log('error happened')
        } else {
            user.update({
                user_type: 'business'
            })
        }
    })

})


router.put('/api/filterSupplierProducts', async (req, res) => {


    var wh = {}

    wh.user_id = req.body.user_id

    if (req.body.productsSearch) {
        wh.product_name = {
            [Op.substring]: req.body.productsSearch
        }
    }
    if (req.body.categoryName) {
        if (req.body.siteLanguage == 'en') {
            await db.product_categories.findOne({
                where: {
                    category_name: req.body.categoryName
                }
            }).then(category => {
                wh.category_id = category.category_id
            })
        } else {
            await db.product_categories.findOne({
                where: {
                    category_arabic_name: req.body.categoryName
                }
            }).then(category => {
                wh.category_id = category.category_id
            })
        }

    }

    if (req.body.itemName) {
        if (req.body.siteLanguage == 'en') {
            await db.category_items.findOne({
                where: {
                    category_items: req.body.itemName
                }
            }).then(item => {
                wh.category_items_id = item.category_items_id
            })
        } else {
            await db.category_items.findOne({
                where: {
                    category_items_arabic_name: req.body.itemName
                }
            }).then(item => {
                wh.category_items_id = item.category_items_id
            })
        }

    }

    await db.products.findAll({
        where: wh
    }).then(products => {
        res.json({
            message: 'products Found',
            data: products
        })

    })

})

router.post('/api/addCategoryAndItemsToSupplier', async (req, res) => {
    console.log('supplier items', req.body.supplierItems)
    var supplierItems = req.body.supplierItems;
    var itemsId = []

    db.suppliers_items.findAll({
        where: {
            user_id: req.body.user_id
        }
    }).then(items => {
        items.forEach(e => {
            e.destroy()
        })
    })

    for (let i = 0; i < supplierItems.length; i++) {
        console.log('supplierItems', supplierItems[i])
        var item = await db.product_categories.findOne({
            where: {
                category_name: supplierItems[i]
            }
        })

        itemsId.push(item.category_id)
    }
    itemsId.forEach(id => {
        db.suppliers_items.create({
            user_id: req.body.user_id,
            category_id: id
        })
    })







    // await db.suppliers_items.findAll({
    //     where: {
    //         user_id: req.body.user_id
    //     }
    // }).then(async checkingItems => {



    //     if (checkingItems) {

    //         checkingItems.forEach(e => {
    //             e.destroy()
    //         })
    //         if (req.body.siteLanguage == 'en') {
    //             for (var i = 0; i < supplierItems.length; i++) {
    //                 var item = await db.category_items.findOne({
    //                     where: {
    //                         category_items: supplierItems[i]
    //                     }
    //                 })
    //                 await db.suppliers_items.create({
    //                     user_id: req.body.user_id,
    //                     category_items_id: item.category_items_id,
    //                     item_name: req.body.supplierItems[i],
    //                     category_id: item.category_id,
    //                     item_arabic_name: item.category_items_arabic_name


    //                 })


    //             }
    //         }
    //         else {
    //             for (var x = 0; x < supplierItems.length; x++) {
    //                 var item = await db.category_items.findOne({
    //                     where: {
    //                         category_items_arabic_name: supplierItems[x]
    //                     }
    //                 })
    //                 await db.suppliers_items.create({
    //                     user_id: req.body.user_id,
    //                     category_items_id: item.category_items_id,
    //                     item_name: item.category_items,
    //                     category_id: item.category_id,
    //                     item_arabic_name: item.category_items_arabic_name

    //                 })


    //             }
    //         }

    //         res.json({ message: 'Items added successfully' })
    //     }
    //     else {
    //         for (var i = 0; i < supplierItems.length; i++) {
    //             var item = await db.category_items.findOne({
    //                 where: {
    //                     category_items: supplierItems[i]
    //                 }
    //             })
    //             await db.suppliers_items.create({
    //                 user_id: req.body.user_id,
    //                 category_items_id: item.category_items_id,
    //                 item_name: req.body.supplierItems[i],
    //                 category_id: item.category_id
    //             })


    //         }
    //         res.json({ message: 'Items added successfully' })
    //     }

    // }).catch(err => { console.log(err) })



})

// router.put('/api/getSupplierItems', (req, res) => {
//     console.log('id isss', req.body.user_id)
//     db.suppliers_items.findAll({
//         where: {
//             user_id: req.body.user_id
//         }
//     }).then(items => {
//         res.json({ message: 'supplier items found', data: items })
//     })
// })


router.put('/api/getSupplierCategoriesAndItems', async (req, res) => {
    if (req.body.user_id) {
        console.log('idd of user', req.body.user_id)
        db.suppliers_items.findAll({
            where: {
                user_id: req.body.user_id,

            },
            include: [{
                model: db.product_categories
            }]
        }).then(items => {
            res.json({
                data: items,
                message: 'category and items successfullly entered'
            })
        })
    }


})

router.put('/api/rejectSupplierRequest', (req, res) => {
    db.users.findOne({
        where: {
            user_id: req.body.user_id
        }
    }).then(user => {
        user.destroy()
        res.json({
            message: 'Supplier Request Denied'
        })
    })
})


module.exports = router;