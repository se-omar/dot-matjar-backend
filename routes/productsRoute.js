const express = require("express");
const router = express.Router();
const db = require("../database");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const path = require("path");
const { cart, product_categories } = require("../database");

router.use((req, res, next) => {
    if (req.originalUrl === "/webhook") {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

router.use(cors());

var imagedir = path.join(__dirname.substr(0, __dirname.length - 6), "/allUploads/");
router.use(express.static(imagedir));

var storage2 = multer.diskStorage({
    destination: "./allUploads/productImages",
    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now() + ".jpg");
    },
});
const upload2 = multer({
    storage: storage2,
});

//===========================================================
//PRODUCTS TABLE
router.post("/api/products", (req, res) => {
    if (!req.body.product_id) {
        db.products
            .findAll({
                include: [
                    {
                        model: db.users,
                    },
                    {
                        model: db.product_categories,
                    },
                ],

                limit: 20,
            })
            .then((products) => {
                res.json({
                    products: products,
                });
            });
    } else {
        db.products
            .findAll({
                include: [
                    {
                        model: db.users,
                    },
                    {
                        model: db.product_categories,
                    },
                ],

                where: {
                    product_id: {
                        [Op.gt]: req.body.product_id,
                    },
                },
                limit: 20,
            })
            .then((products) => {
                res.json({
                    products: products,
                });
            });
    }
    // db.products_generator.findAll().then(products => {
    //     res.json({ products: products })
    // })
});

router.post("/api/loadMoreProductsWithFilter", async (req, res) => {
    if (!req.body.category_name) {
        console.log("product entered");
        db.products
            .findAll({
                where: {
                    product_id: {
                        [Op.gt]: req.body.product_id,
                    },
                    product_name: {
                        [Op.substring]: req.body.product_name,
                    },
                },
                include: [
                    {
                        model: db.users,
                    },
                    {
                        model: db.product_categories,
                    },
                ],
                limit: 20,
            })
            .then((products) => {
                res.json({
                    products: products,
                    message: "searched by productName",
                });
            });
    } else if (!req.body.product_name) {
        console.log("category entered");
        var cat = await db.product_categories.findOne({
            where: {
                category_name: req.body.category_name,
            },
        });
        db.products
            .findAll({
                where: {
                    product_id: {
                        [Op.gt]: req.body.product_id,
                    },
                    category_id: cat.category_id,
                },
                include: [
                    {
                        model: db.users,
                    },
                    {
                        model: db.product_categories,
                    },
                ],
                limit: 20,
            })
            .then((products) => {
                res.json({
                    products: products,
                    message: "searched by category",
                });
                console.log(products.length);
            });
    } else {
        var cat = await db.product_categories.findOne({
            where: {
                category_name: req.body.category_name,
            },
        });
        var products = await db.products.findAll({
            where: {
                product_id: {
                    [Op.gt]: req.body.product_id,
                },
                category_id: cat.category_id,
                product_name: req.body.product_name,
            },
            include: [
                {
                    model: db.users,
                },
                {
                    model: db.product_categories,
                },
            ],

            limit: 20,
        });
        res.json({
            products: products,
            message: "searched by both",
        });
    }
});

router.post("/api/myProducts", (req, res) => {
    db.products
        .findAll({
            where: {
                user_id: req.body.user_id,
            },
            include: [
                {
                    model: db.users,
                },
                {
                    model: db.product_categories,
                },
            ],
        })
        .then((response) => {
            if (!response) {
                res.send("no products found for this user");
                return;
            }
            res.send(response);
        });
});

//POST METHOD

router.post('/api/productTest', async (req, res, next) => {
    var cat = await db.product_categories.findOne({
        where: {
            category_id: req.body.category_id
        }
    })

    var product = await db.products
        .create({
            category_id: req.body.category_id,
        })

    var parentId = cat.parent_id
    var catId = cat.category_id
    var parentCat;
    var closure;
    while (parentId != null) {
        closure = await db.categories_closure.create({
            product_id: product.product_id,
            category_id: catId
        })
        catId = parentId

        parentCat = await db.product_categories.findOne({
            where: {
                category_id: catId
            }
        })
        parentId = parentCat.parent_id
    }

    if (parentCat && parentCat.parent_id == null) {
        closure = await db.categories_closure.create({
            product_id: product.product_id,
            category_id: parentCat.category_id
        })
    }

    res.send('finish')

})

router.post("/api/product", upload2.array("file", 12), async (req, res, next) => {
    console.log("uploaded file", req.files);
    var cat = await db.product_categories.findOne({
        where: {
            category_id: req.body.category_id
        }
    })

    var product = await db.products
        .create({
            product_name: req.body.product_name,
            category_id: cat ? cat.category_id : 64,
            quantity: req.body.quantity,
            user_id: req.body.user_id,
            brand: req.body.brand,
            condition: req.body.condition,
            min_units_per_order: req.body.min_units_per_order,
            unit_price: req.body.unit_price,
            size: req.body.size,
            description: req.body.describtion,
            unit_weight: req.body.unit_weight,
            has_discount: req.body.has_discount,
            discount_amount: req.body.discount_amount,
            availability: req.body.availability,
            product_rating: req.body.product_rating,
            main_picture: req.files[0] ? req.files[0].path.substr(11) : null,
            extra_picture1: req.files[1] ? req.files[1].path.substr(11) : null,
            extra_picture2: req.files[2] ? req.files[2].path.substr(11) : null,
            currency: req.body.currency,
        })

    var colors = req.body.colors.split(',');
    if (colors && colors.length > 0) {
        for (var i = 0; i < colors.length; i++) {
            await db.products_colors.create({
                product_id: product.product_id,
                color: colors[i]
            })
        }

    }


    var parentId = cat.parent_id
    var catId = cat.category_id
    var parentCat;
    var closure;

    do {
        closure = await db.categories_closure.create({
            product_id: product.product_id,
            category_id: catId
        })
        catId = parentId

        parentCat = await db.product_categories.findOne({
            where: {
                category_id: catId
            }
        })
        parentId = parentCat ? parentCat.parent_id : null
    }
    while (parentId != null)

    if (parentCat && parentCat.parent_id == null) {
        closure = await db.categories_closure.create({
            product_id: product.product_id,
            category_id: parentCat.category_id
        })
    }
    res.send('product added successfully')
});

router.post("/api/updateProduct", upload2.array("file", 12), async (req, res, next) => {
    console.log("uploaded file", req.files);
    db.products
        .findOne({
            where: {
                product_id: req.body.product_id,
            },
        })
        .then((product) => {
            if (product) {
                product
                    .update({
                        product_name: req.body.product_name,
                        product_code: req.body.product_code,
                        user_id: req.body.user_id,
                        HS_code: req.body.HS_code,
                        min_units_per_order: req.body.min_units_per_order,
                        unit_price: req.body.unit_price,
                        size: req.body.size,
                        description: req.body.description,
                        unit_weight: req.body.unit_weight,
                        has_discount: req.body.has_discount,
                        discount_amount: req.body.discount_amount,
                        availability: req.body.availability,
                        product_rating: req.body.product_rating,
                        main_picture: req.files[0]
                            ? req.files[0].path.substr(11)
                            : product.main_picture,
                        extra_picture1: req.files[1]
                            ? req.files[1].path.substr(11)
                            : product.extra_picture1,
                        extra_picture2: req.files[2]
                            ? req.files[2].path.substr(11)
                            : product.extra_picture2,
                        currency: req.body.currency,
                    })
                    .then((response) => {
                        res.send(response);
                    });
            } else {
                res.send("cant find product");
            }
        });

    await db.products_colors.destroy({
        where: {
            product_id: req.body.product_id
        }
    })
    var colors = req.body.colors.split(",")
    for (var i = 0; i < colors.length; i++) {
        await db.products_colors.create({
            product_id: req.body.product_id,
            color: colors[i]
        })
    }

});

router.delete("/api/removeProduct/:product_id", (req, res) => {
    db.products
        .findOne({
            where: {
                product_id: req.params.product_id,
            },
        })
        .then((product) => {
            db.cart_products
                .findOne({
                    where: {
                        product_id: product.product_id,
                    },
                })
                .then((row) => {
                    if (!row) {
                        product.destroy();
                        res.send("ROW DELETED");
                    } else {
                        row.destroy();
                        product.destroy();
                        res.send("ROW DELETED");
                    }
                });
        });
});

router.put("/api/selectCategory", async (req, res) => {
    var cat = await db.product_categories.findAll();
    res.json({
        data: cat,
    });
});

router.put("/api/filterProducts", async (req, res) => {
    var gov = req.body.governorate;
    var reg = req.body.region;
    var prodname = req.body.product_name;
    var catId = req.body.category_id;
    var priceFrom = req.body.priceFrom;
    var priceTo = req.body.priceTo;
    var product_id = req.body.product_id;
    var siteLanguage = req.body.siteLanguage;
    var categoriesId = [];
    var closureProducts;
    var wh = {};


    var cat = await db.product_categories.findOne({
        where: {
            category_id: catId,
        },
    });

    if (catId && catId != 64) {
        if (cat) {
            closureProducts = await db.categories_closure.findAll({
                where: {
                    category_id: cat.category_id,
                },
            });
        }


        if (closureProducts && closureProducts.length > 0) {
            var i = 0;
            for (i = 0; i < closureProducts.length; i++) {
                var product = await db.products.findOne({
                    where: {
                        product_id: closureProducts[i].product_id,
                    },
                });

                categoriesId.indexOf(product.category_id) === -1
                    ? categoriesId.push(product.category_id)
                    : console.log("value repeated");
            }
        }

        if (catId) {
            wh.category_id = {
                [Op.or]: categoriesId.length > 0 ? categoriesId : [false],
            };
        }
    }


    if (gov) {
        wh.governorate = gov;
    }
    if (reg) {
        wh.region = reg;
    }
    if (prodname) {
        wh.product_name = { [Op.substring]: prodname };
    }

    if (priceFrom && !priceTo) {
        wh.unit_price = { [Op.gte]: priceFrom };
    } else if (priceTo && !priceFrom) {
        wh.unit_price = { [Op.lte]: priceTo };
    } else if (priceFrom && priceTo) {
        wh.unit_price = { [Op.between]: [priceFrom, priceTo] };
    }



    wh.product_id = { [Op.gt]: product_id };

    console.log(wh);
    var products = await db.products
        .findAll({
            include: [{ model: db.users }, { model: db.product_categories }],
            where: wh,
            limit: 20,
        })

    res.json({
        message: "test search",
        data: products,
    });

});

router.put("/api/loadmoreProducts", async (req, res) => {
    var loadmoreType = req.body.loadmoreType;
    var loadmoreName = req.body.loadmoreName;
    var prodname = req.body.productName;
    var priceFrom = req.body.priceFrom;
    var priceTo = req.body.priceTo;
    var gov = req.body.governorate;
    var reg = req.body.region;
    var wh = {};
    wh.product_id = { [Op.gt]: req.body.product_id };
    if (loadmoreType == "item") {
        if (req.body.siteLanguage == "en") {
            var loadmoreItem = await db.category_items.findOne({
                where: {
                    category_items: loadmoreName,
                },
            });
        } else {
            var loadmoreItem = await db.category_items.findOne({
                where: {
                    category_items_arabic_name: loadmoreName,
                },
            });
        }

        wh.category_items_id = loadmoreItem.category_items_id;
    }
    if (loadmoreType == "category") {
        if (req.body.siteLanguage == "en") {
            var loadmoreCategory = await db.product_categories.findOne({
                where: {
                    category_name: loadmoreName,
                },
            });
        } else {
            var loadmoreCategory = await db.product_categories.findOne({
                where: {
                    category_arabic_name: loadmoreName,
                },
            });
        }

        console.log("category entered", loadmoreCategory.category_id);
        wh.category_id = loadmoreCategory.category_id;
    }
    if (prodname) {
        wh.product_name = { [Op.substring]: prodname };
    }
    if (gov) {
        wh.governorate = gov;
    }
    if (reg) {
        wh.region = reg;
    }

    if (priceFrom && !priceTo) {
        wh.unit_price = { [Op.gte]: priceFrom };
    } else if (priceTo && !priceFrom) {
        wh.unit_price = { [Op.lte]: priceTo };
    } else if (priceFrom && priceTo) {
        wh.unit_price = { [Op.between]: [priceFrom, priceTo] };
    }

    db.products
        .findAll({
            include: [
                {
                    model: db.users,
                },
                {
                    model: db.product_categories,
                },
            ],
            where: wh,
            limit: 20,
        })
        .then((products) => {
            res.json({
                message: "test search",
                data: products,
            });
        });
});

router.put("/api/filterSuppliers", (req, res) => {
    if (!req.body.governorate) {
        console.log("name search");
        db.users
            .findAll({
                where: {
                    user_type: "business",
                    full_arabic_name: {
                        [Op.substring]: req.body.name,
                    },
                },
                limit: 10,
            })
            .then((users) => {
                res.json({
                    users: users,
                });
            });
    } else if (!req.body.name && !req.body.region) {
        console.log("governorate srarch");
        db.users
            .findAll({
                where: {
                    governorate: req.body.governorate,
                },
                limit: 10,
            })
            .then((users) => {
                res.json({ users: users });
            });
    } else if (!req.body.region) {
        console.log("name and governorate");
        db.users
            .findAll({
                where: {
                    governorate: req.body.governorate,
                    full_arabic_name: {
                        [Op.substring]: req.body.name,
                    },
                },
                limit: 10,
            })
            .then((users) => {
                if (!users) {
                    res.json({ message: "suppliers not found" });
                } else {
                    res.json({ users: users });
                }
            });
    } else if (!req.body.name) {
        console.log("location search");
        db.users
            .findAll({
                where: {
                    governorate: req.body.governorate,
                    region: req.body.region,
                },
                limit: 10,
            })
            .then((users) => {
                if (!users) {
                    res.json({ message: "No suppliers found" });
                } else {
                    res.json({
                        users: users,
                    });
                }
            });
    } else {
        console.log("both search");
        db.users
            .findAll({
                where: {
                    user_type: "business",
                    governorate: req.body.governorate,
                    full_arabic_name: {
                        [Op.substring]: req.body.name,
                    },
                    region: req.body.region,
                },
                limit: 10,
            })
            .then((users) => {
                if (!users) {
                    res.json({ message: "No suppliers found" });
                } else {
                    res.json({
                        users: users,
                    });
                }
            });
    }
});

router.put("/api/updateProductStatus", async (req, res) => {
    console.log(
        "get data from frontend testing ",
        req.body.status,
        req.body.orderId,
        req.body.productId
    );
    var orderedProduct = await db.products_orders.findOne({
        where: {
            order_id: req.body.orderId,
            product_id: req.body.productId,
        },
    });
    if (orderedProduct) {
        orderedProduct.update({
            status: req.body.status,
        });
        res.json({ message: "ordere status updated" });
    } else {
        res.json({ message: "Something went WRONG" });
    }
});
router.post("/api/addProductReview", (req, res) => {
    db.products_reviews
        .findOne({
            where: {
                user_id: req.body.user_id,
                product_id: req.body.product_id,
            },
        })
        .then((row) => {
            if (!row) {
                db.products_reviews
                    .create({
                        product_id: req.body.product_id,
                        user_id: req.body.user_id,
                        rating: req.body.rating,
                        review: req.body.review,
                    })
                    .then((response) => {
                        res.json({
                            message: "review placed successfully",
                            review: response,
                        });
                    });
            } else {
                res.json({
                    message: "you already placed a review",
                    review: row,
                });
            }
        });
});

router.post("/api/getProductRatingsArray", (req, res) => {
    db.products_reviews
        .findAll({
            where: {
                product_id: req.body.product_id,
            },
            include: [
                {
                    model: db.users,
                },
            ],
        })
        .then((rows) => {
            res.json({
                rows: rows,
            });
        });
});

router.post("/api/getProductReview", (req, res) => {
    var wh = {};

    if (req.body.user_id && req.body.user_id != null) {
        wh.user_id = req.body.user_id;
        console.log("uuser id", req.body.user_id);
    }
    if (req.body.product_id) {
        wh.product_id = req.body.product_id;
    }
    db.products_reviews
        .findOne({
            where: wh,
        })
        .then((row) => {
            if (!row) {
                res.json({
                    message: "no review found",
                    review: {
                        rating: 0,
                        review: "",
                    },
                });
            } else {
                res.json({
                    message: "review was found",
                    review: row,
                });
            }
        });
});

router.post("/api/calculateProductRating", (req, res) => {
    db.products_reviews
        .findAll({
            where: {
                product_id: req.body.product_id,
            },
        })
        .then((rows) => {
            var rating = 0;
            var counter = 0;
            var average = 0;
            rows.forEach((element) => {
                rating += element.rating;
                counter++;
            });
            console.log("primary key", req.body.product_id);
            average = rating / counter;
            db.products.findByPk(req.body.product_id).then((product) => {
                product.update({
                    rating: average,
                    rate_counter: counter,
                });
            });
            res.json({
                message: "rating placed in product",
            });

            // console.log('raating is ', rating)
            // console.log('average is ', average)
        });
});

router.post("/api/addNewCategory", async (req, res) => {
    console.log("item name", req.body.itemArabicName);
    console.log("category name", req.body.categoryArabicName);

    var category = await db.product_categories.findOne({
        where: {
            category_name: req.body.categoryName,
        },
    });
    if (category) {
        res.json({ message: "Category already exists" });
    } else {
        db.product_categories
            .create({
                category_name: req.body.categoryName,
                category_arabic_name: req.body.categoryArabicName,
            })
            .then(res.json({ message: "Category is added" }));
    }
});

router.post("/api/addCategoryItems", async (req, res) => {
    if (req.body.categoryItem == " ") {
        res.json({ message: "Please enter an item name" });
    } else {
        var checkIfItemExists = await db.category_items.findOne({
            where: {
                category_items: req.body.categoryItem,
            },
        });

        if (checkIfItemExists) {
            res.json({ message: "Item already exists" });
        } else {
            var category = await db.product_categories.findOne({
                where: {
                    category_name: req.body.categoryName,
                },
            });

            db.category_items
                .create({
                    category_id: category.category_id,
                    category_name: category.category_name,
                    category_items: req.body.categoryItem,
                    category_items_arabic_name: req.body.itemArabicName,
                    category_arabic_name: category.category_arabic_name,
                })
                .then(res.json({ message: "Items added successfully" }));
        }
    }
});

router.put("/api/getCategoryItems", (req, res) => {
    db.category_items.findAll().then((category) => {
        res.json({ message: "found", data: category });
    });
});

router.put("/api/removeCategoryAndItems", async (req, res) => {
    var wh = [];
    console.log("testing cateogry name ", req.body.categoryName, req.body.categoryItem);

    if (req.body.categoryName && req.body.categoryItem.length == 0) {
        console.log("first if entered");
        db.category_items
            .findAll({
                where: {
                    category_name: req.body.categoryName,
                },
            })
            .then((items) => {
                items.forEach((e) => {
                    e.destroy();
                });
            });
        var category = await db.product_categories.findOne({
            where: {
                category_name: req.body.categoryName,
            },
        });

        db.products
            .findAll({
                where: {
                    category_id: category.category_id,
                },
            })
            .then((products) => {
                products.forEach((e) => {
                    e.update({
                        category_id: null,
                        category_items_id: null,
                    });
                });
                category.destroy();
            });
    } else if (req.body.categoryName && req.body.categoryItem.length > 0) {
        console.log("socond if entered");
        db.category_items
            .findOne({
                where: {
                    category_name: req.body.categoryName,
                    category_items: req.body.categoryItem,
                },
            })
            .then((item) => {
                item.destroy();
            });
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
});

router.post("/api/checkIfUserOrdered", (req, res) => {
    var wh = {};
    if (req.body.user_id) {
        wh.user_id = req.body.user_id;
    }
    if (req.body.product_id) {
        wh.product_id = req.body.product_id;
    }
    db.products_orders
        .findOne({
            where: wh,
        })
        .then((row) => {
            if (!row) {
                res.json({
                    message: "row not found",
                });
            } else {
                res.json({
                    message: "row found",
                    row: row,
                });
            }
        });
});

router.post("/api/requestNewCategoryAndItem", async (req, res) => {
    var wh = {};

    // if (req.body.newCategoryName) {
    //     wh.new_category_name = req.body.newCategoryName;
    // }
    // if (req.body.newCategoryDescription) {
    //     wh.new_category_description = req.body.newCategoryDescription;
    // }
    // if (req.body.newCategoryItem) {
    //     wh.new_category_item = req.body.newCategoryItem;
    // }
    // if (req.body.newCategoryItemDescription) {
    //     wh.new_item_description = req.body.newCategoryItemDescription;
    // }
    // if (req.body.categoryName) {
    //     wh.category_name = req.body.categoryName;
    // }


    if (req.body.requestType == 'parent') {
        db.categories_request.create({
            request_type: "category",
            user_id: req.body.user_id,
            new_category_name: req.body.newParentCategory,
            new_category_description: req.body.newParentDescription,
            new_category_arabic_name: req.body.newParentCategoryArabic,
        });
    }
    if (req.body.requestType == 'child') {
        db.categories_request.create({
            request_type: "category",
            user_id: req.body.user_id,
            new_category_name: req.body.newCategoryName,
            new_category_description: req.body.newCategoryDescription,
            new_category_arabic_name: req.body.categoryArabicName,
            parent_id: req.body.parentCategoryId
        });
    }
});

router.get("/api/getCategoryAndItemRequests", (req, res) => {
    db.categories_request
        .findAll({
            include: [{ model: db.users }],
        })
        .then((requests) => {
            res.json({ message: "Requested Categories and item", data: requests });
        });
});

router.put("/api/categoryAndItemRequestStatus", async (req, res) => {
    var category = await db.categories_request.findOne({
        where: {
            id: req.body.id,
        },
    });
    if (category) {
        category
            .update({
                status: req.body.status,
            })
            .then();

        if (req.body.status == "Accepted") {
            if (req.body.requestType == "category") {
                var checkCategoryexist = await db.product_categories.findOne({
                    where: {
                        category_name: req.body.newCategoryName,
                    },
                });

                if (!checkCategoryexist) {
                    db.product_categories
                        .create({
                            category_name: req.body.newCategoryName,
                            description: req.body.newCategoryDescription,
                            category_arabic_name: req.body.categoryArabicName,
                            parent_id: req.body.parent_id
                        })
                        .then(res.json({ message: `Request ${req.body.status} Successfully` }));
                } else {
                    res.json({ message: "Category already Exists" });
                }
            } else {
                var checkIfItemExists = await db.category_items.findOne({
                    where: {
                        category_items: req.body.newCategoryItem,
                    },
                });
                if (checkIfItemExists) {
                    res.json({ message: "item already exists" });
                } else {
                    db.product_categories
                        .findOne({
                            where: {
                                category_name: req.body.newItemCategoryName,
                            },
                        })
                        .then((category) => {
                            db.category_items
                                .create({
                                    category_id: category.category_id,
                                    category_name: category.category_name,
                                    category_items: req.body.newCategoryItem,
                                    category_arabic_name: category.category_arabic_name,
                                    category_items_arabic_name: req.body.itemArabicName,
                                })
                                .then(
                                    res.json({
                                        message: `Request ${req.body.status} Successfully`,
                                    })
                                );
                        });
                }
            }
        } else {
            res.json({ message: `Request ${req.body.status} Successfully` });
        }
    } else {
        res.json({ message: "Request Denied" });
    }
});

router.put("/api/getSupplierCategoriesRequests", (req, res) => {
    console.log("user id iss", req.body.user_id);

    db.categories_request
        .findAll({
            where: {
                user_id: req.body.user_id,
            },
        })
        .then((requests) => {
            res.json({ data: requests, message: "requests found" });
        });
});

router.put("/api/getAvailableCountries", (req, res) => {
    db.available_countries.findAll().then((countries) => {
        res.json({ data: countries });
    });
});

router.post("/api/getProductColors", (req, res) => {
    db.products_colors.findAll({
        where: {
            product_id: req.body.product_id
        }
    }).then(rows => {
        var colors = []
        if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
                colors.push(rows[i].color)
            }
        }
        res.json({
            colors
        })
    })
})

module.exports = router;
