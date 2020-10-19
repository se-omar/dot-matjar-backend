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
            include: [{
                model: db.users
            }, {
                model: db.product_categories
            }],

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
    // db.products_generator.findAll().then(products => {
    //     res.json({ products: products })
    // })

});

router.post('/api/loadMoreProductsWithFilter', async (req, res) => {
    if (!req.body.category_name) {
        console.log('product entered')
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
                products: products,
                message: 'searched by productName'
            })
        })


    } else if (!req.body.product_name) {
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
                products: products,
                message: 'searched by category'
            })
            console.log(products.length)
        })

    } else {
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
            products: products,
            message: 'searched by both'
        })
    }
})

router.post('/api/myProducts', (req, res) => {
    db.products.findAll({
        where: {
            user_id: req.body.user_id
        },
        include: [{
            model: db.users
        },
        {
            model: db.product_categories,
        },]
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
    var cat = await db.product_categories.findOne({
        where: {
            category_name: req.body.category_name
        }
    })

    var catItem = await db.category_items.findOne({
        where: {
            category_items: req.body.category_item
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
        description: req.body.describtion,
        unit_weight: req.body.unit_weight,
        has_discount: req.body.has_discount,
        discount_amount: req.body.discount_amount,
        availability: req.body.availability,
        product_rating: req.body.product_rating,
        main_picture: req.files[0] ? req.files[0].path.substr(11) : null,
        extra_picture1: req.files[1] ? req.files[1].path.substr(11) : null,
        extra_picture2: req.files[2] ? req.files[2].path.substr(11) : null,
        category_items_id: catItem.category_items_id
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


router.put('/api/selectCategory', async (req, res) => {
    var cat = await db.product_categories.findAll()
    res.json({
        data: cat
    })

})

router.put('/api/filterProducts', async (req, res) => {
    var gov = req.body.governorate
    var reg = req.body.region
    var prodname = req.body.product_name
    var catname = req.body.category_name
    var catItem = req.body.categoryItem
    var siteLanguage = req.body.siteLanguage
    if (catname && siteLanguage == 'en') {
        var cat = await db.product_categories.findOne({
            where: {
                category_name: catname
            }
        })
    }
    if (catname && siteLanguage == 'ar') {
        var cat = await db.product_categories.findOne({
            where: {
                category_arabic_name: catname
            }
        })
    }
    if (catItem && siteLanguage == 'en') {
        var item = await db.category_items.findOne({
            where: {
                category_items: catItem
            }
        })
    }
    if (catItem && siteLanguage == 'ar') {
        var item = await db.category_items.findOne({
            where: {
                category_items_arabic_name: catItem
            }
        })
    }

    var wh = {}
    if (gov) {
        wh.governorate = gov
    }
    if (reg) {
        wh.region = reg
    }
    if (prodname) {
        wh.product_name = { [Op.substring]: prodname }
    }
    if (catname) {
        wh.category_id = cat.category_id
    }
    // if (catname) {
    //     var cat = await db.product_categories.findOne({
    //         where: {
    //             category_name: catname
    //         }
    //     })
    // }

    if (catItem) {
        wh.category_items_id = item.category_items_id
    }


    db.products.findAll({
        where: wh,
        limit: 20,
    }).then(products => {
        res.json({
            message: 'test search',
            data: products
        })

    })

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

router.put('/api/updateProductStatus', async (req, res) => {
    console.log('get data from frontend testing ', req.body.status, req.body.orderId, req.body.productId)
    var orderedProduct = await db.products_orders.findOne({
        where: {
            order_id: req.body.orderId,
            product_id: req.body.productId
        }
    })
    if (orderedProduct) {
        orderedProduct.update({
            status: req.body.status
        })
        res.json({ message: 'ordere status updated' })
    }
    else { res.json({ message: 'Something went WRONG' }) }
})
router.post('/api/addProductReview', (req, res) => {
    db.products_reviews.findOne({
        where: {
            user_id: req.body.user_id,
            product_id: req.body.product_id
        }
    }).then(row => {
        if (!row) {
            db.products_reviews.create({
                product_id: req.body.product_id,
                user_id: req.body.user_id,
                rating: req.body.rating,
                review: req.body.review
            }).then(response => {
                res.json({
                    message: 'review placed successfully',
                    review: response
                })
            })
        }
        else {
            res.json({
                message: 'you already placed a review',
                review: row
            })
        }
    })

})

router.post('/api/getProductRatingsArray', (req, res) => {
    db.products_reviews.findAll({
        where: {
            product_id: req.body.product_id
        },
        include: [{
            model: db.users
        }]
    }).then(rows => {
        res.json({
            rows: rows
        })
    })
})

router.post('/api/getProductReview', (req, res) => {
    console.log(req.body.user_id)
    db.products_reviews.findOne({
        where: {
            user_id: req.body.user_id,
            product_id: req.body.product_id
        }
    }).then(row => {
        if (!row) {
            res.json({
                message: 'no review found',
                review: {
                    rating: 0,
                    review: ''
                }
            })
        }
        else {
            res.json({
                message: 'review was found',
                review: row
            })
        }
    })
})

router.post('/api/calculateProductRating', (req, res) => {
    db.products_reviews.findAll({
        where: {
            product_id: req.body.product_id
        }
    }).then(rows => {
        var rating = 0;
        var counter = 0;
        var average = 0;
        rows.forEach(element => {
            rating += element.rating
            counter++
        });
        console.log('primary key', req.body.product_id)
        average = rating / counter;
        db.products.findByPk(req.body.product_id).then(product => {
            product.update({
                rating: average,
                rate_counter: counter
            })
        })
        res.json({
            message: 'rating placed in product'
        })

        // console.log('raating is ', rating)
        // console.log('average is ', average)
    })

})



router.post('/api/addNewCategory', async (req, res) => {
    console.log('item name', req.body.itemArabicName)
    console.log('category name', req.body.categoryArabicName)

    var category = await db.product_categories.findOne({
        where: {
            category_name: req.body.categoryName
        }
    })
    if (category) { res.json({ message: 'Category already exists' }) }
    else {
        db.product_categories.create({
            category_name: req.body.categoryName,
            category_arabic_name: req.body.categoryArabicName
        }).then(res.json({ message: "Category is added" }))
    }

})

router.post('/api/addCategoryItems', async (req, res) => {
    if (req.body.categoryItem == " ") { res.json({ message: 'Please enter an item name' }) }

    else {


        var checkIfItemExists = await db.category_items.findOne({
            where: {
                category_items: req.body.categoryItem
            }
        })

        if (checkIfItemExists) { res.json({ message: 'Item already exists' }) }
        else {
            var category = await db.product_categories.findOne({
                where: {
                    category_name: req.body.categoryName
                }
            })

            db.category_items.create({
                category_id: category.category_id,
                category_name: category.category_name,
                category_items: req.body.categoryItem,
                category_items_arabic_name: req.body.itemArabicName,
                category_arabic_name: category.category_arabic_name
            }).then(res.json({ message: 'Items added successfully' }))
        }
    }
})

router.put('/api/getCategoryItems', (req, res) => {
    db.category_items.findAll().then(category => {
        res.json({ message: 'found', data: category })
    })
})


router.put('/api/removeCategoryAndItems', async (req, res) => {
    var wh = []
    console.log('testing cateogry name ', req.body.categoryName, req.body.categoryItem)

    if (req.body.categoryName && req.body.categoryItem.length == 0) {
        console.log("first if entered")
        db.category_items.findAll({
            where: {
                category_name: req.body.categoryName
            }
        }).then(items => {
            items.forEach(e => {
                e.destroy()
            })
        })
        var category = await db.product_categories.findOne({
            where: {
                category_name: req.body.categoryName
            }
        })

        db.products.findAll({
            where: {
                category_id: category.category_id
            }
        }).then(products => {
            products.forEach(e => {
                e.update({
                    category_id: null,
                    category_items_id: null
                })
            })
            category.destroy()
        })


    }


    else if (req.body.categoryName && req.body.categoryItem.length > 0) {
        console.log('socond if entered')
        db.category_items.findOne({
            where: {
                category_name: req.body.categoryName,
                category_items: req.body.categoryItem
            }
        }).then(item => { item.destroy() })

    }






    // await db.product_categories.findOne({
    //     where: {
    //         category_name: req.body.categoryName
    //     }
    // }).then(category => {
    //     category.destroy()
    // })
    // if (req.body.categoryItem) {
    //     await db.category_items.findOne({
    //         where: {
    //             category_items: req.body.categoryItem
    //         }
    //     }).then(item => {
    //         item.destroy()
    //     })
    // }
    // res.json({ message: 'removed successfully' })
})


router.post('/api/checkIfUserOrdered', (req, res) => {
    db.products_orders.findOne({
        where: {
            user_id: req.body.user_id,
            product_id: req.body.product_id
        }
    }).then(row => {
        if (!row) {
            res.json({
                message: 'row not found'
            })
        }
        else {
            res.json({
                message: 'row found',
                row: row
            })
        }
    })
})




router.post('/api/requestNewCategoryAndItem', async (req, res) => {
    var wh = {};

    if (req.body.newCategoryName) {
        wh.new_category_name = req.body.newCategoryName
    }
    if (req.body.newCategoryDescription) {
        wh.new_category_description = req.body.newCategoryDescription
    }
    if (req.body.newCategoryItem) {
        wh.new_category_item = req.body.newCategoryItem
    }
    if (req.body.newCategoryItemDescription) {
        wh.new_item_description = req.body.newCategoryItemDescription
    }
    if (req.body.categoryName) {
        wh.category_name = req.body.categoryName
    }

    if (req.body.newCategoryName) {
        db.categories_request.create({
            request_type: 'category',
            user_id: req.body.user_id,
            new_category_name: req.body.newCategoryName,
            new_category_description: req.body.newCategoryDescription,
            new_category_arabic_name: req.body.categoryArabicName
        })
    }
    if (req.body.newCategoryItem) {
        db.categories_request.create({
            request_type: 'item',
            user_id: req.body.user_id,
            new_category_item: req.body.newCategoryItem,
            new_item_description: req.body.newCategoryItemDescription,
            new_item_category_name: req.body.categoryName,
            new_item_arabic_name: req.body.itemArabicName
        })
    }

})

router.get('/api/getCategoryAndItemRequests', (req, res) => {
    db.categories_request.findAll({
        include: [
            { model: db.users }
        ]
    })
        .then(requests => {
            res.json({ message: 'Requested Categories and item', data: requests })
        })
})

router.put('/api/categoryAndItemRequestStatus', async (req, res) => {
    var category = await db.categories_request.findOne({
        where: {
            id: req.body.id
        }
    })
    if (category) {
        category.update({
            status: req.body.status
        }).then()


        if (req.body.status == 'Accepted') {


            if (req.body.requestType == 'category') {


                var checkCategoryexist = await db.product_categories.findOne({
                    where: {
                        category_name: req.body.newCategoryName
                    }
                })

                if (!checkCategoryexist) {

                    db.product_categories.create({
                        category_name: req.body.newCategoryName,
                        description: req.body.newCategoryDescription,
                        category_arabic_name: req.body.categoryArabicName

                    }).then(res.json({ message: `Request ${req.body.status} Successfully` }))
                }
                else { res.json({ message: 'Category already Exists' }) }

            }

            else {

                var checkIfItemExists = await db.category_items.findOne({
                    where: {
                        category_items: req.body.newCategoryItem
                    }
                })
                if (checkIfItemExists) { res.json({ message: 'item already exists' }) }
                else {
                    db.product_categories.findOne({
                        where: {
                            category_name: req.body.newItemCategoryName
                        }
                    }).then(category => {
                        db.category_items.create({
                            category_id: category.category_id,
                            category_name: category.category_name,
                            category_items: req.body.newCategoryItem,
                            category_arabic_name: category.category_arabic_name,
                            category_items_arabic_name: req.body.itemArabicName

                        }).then(res.json({ message: `Request ${req.body.status} Successfully` }))
                    })
                }



            }

        }
        else {

            res.json({ message: `Request ${req.body.status} Successfully` })
        }
    }
    else {
        res.json({ message: 'Request Denied' })

    }

})



router.put('/api/getSupplierCategoriesRequests', (req, res) => {
    console.log('user id iss', req.body.user_id)

    db.categories_request.findAll({
        where: {
            user_id: req.body.user_id
        }
    }).then(requests => {
        res.json({ data: requests, message: 'requests found' })
    })
})




module.exports = router;