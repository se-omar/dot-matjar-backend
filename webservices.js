const express = require('express');
const db = require('./database');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


const token = crypto.randomBytes(20).toString('hex');
var hashLink = 'http://localhost:8080/updateForgottenPassword/' + token;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

//=============================================
//LOGIN WEBSERVICE
app.post('/api/login', (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.send('please enter email and password')
    }
    db.users.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (user == null) {
            return res.json({
                message: 'wrong email'
            })
        };
        if (req.body.password != user.password) {
            return res.json({
                message: 'wrong password'
            })
        }
        return res.status(200).json({
            message: 'authentication successful',
            data: user
        });

    });

});

//=============================================
//RESET PASSWORD WEBSERVICE
app.post('/api/resetpassword', (req, res) => {
    if (!req.body.email || !req.body.national_number) {
        return res.send('please enter email and national number')
    }
    db.users.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (user == null) {
            return res.send('wrong email')
        };
        if (req.body.national_number != user.national_number) {
            return res.send('wrong national number')
        }

        user.update({
            password_reset_token: hashLink
        })
        return res.status(200).send('authentication succesfull');

    });

});


app.post('/api/sendResetPassword', (req, res) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'miroayman6198@gmail.com',
            pass: 'eshta123'
        }
    });

    var mailOptions = {
        from: 'miroayman6198@gmail.com',
        to: req.body.email,
        subject: 'password reset email',
        text: 'click on the link to reset password ' + hashLink
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.send(hashLink)
});


app.post('/api/sendResetPassword/:token', (req, res) => {
    db.users.findOne({
        where: {
            password_reset_token: 'http://localhost:8080/updateForgottenPassword/' + req.params.token
        }
    }).then(user => {
        if (!user) {
            return res.send('user not found with this hash')
        }
        if (!req.body.password) {
            return res.send('you must enter a password')
        }
        if (req.body.password === user.password) {
            return res.send('the new password cant be the old password')
        }
        user.update({
            password: req.body.password
        })
        return res.send('password updated successfully')
    })
})

app.post('/api/updatePassword', (req, res) => {
    db.users.findOne({
        where: {
            email: req.body.email,
            password: req.body.password,
        }
    }).then(user => {
        if (!user) {
            return res.send('user not found with this password')
        }
        console.log(user)
        user.update({
            password: req.body.newPassword
        })
        return res.send('password updated successfully')
    })
})



//=============================================
//SIGN UP WEBSERVICE
app.post('/api/signup', (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            db.users.findOne({
                where: {
                    email: req.body.email
                }
            }).then(user => {
                if (!user) {
                    db.users.create({
                        email: req.body.email,
                        national_number: req.body.national_number,
                        password: hash,
                        mobile_number: req.body.mobile,
                        full_arabic_name: req.body.full_arabic_name,
                        gender: req.body.gender,
                    })
                    return res.status(200).send('user created succesfully');
                } else {
                    return res.status(400).send('user already exists');
                }
            })
        }
    })
})



//==============================================
//USERS TABLE
app.get('/api/users', async (req, res) => {
    await db.users.findAll({
        include: [{
            model: db.business
        }]
    }).then((data) => {
        res.send(data);
    })
})





app.get('/api/users/:user_id', async (req, res) => {
    var user = await db.users.findOne({
        where: {
            user_id: req.params.user_id
        }
    })
    console.log(user);
    res.send(user);
})

app.get('/api/users/type/:user_type', async (req, res) => {
    var user = await db.users.findAll({
        where: {
            user_type: req.params.user_type
        }
    })
    console.log(user);
    res.send(user);
})

app.get('/api/users/email/:email', async (req, res) => {
    var user = await db.users.findAll({
        where: {
            email: req.params.email
        }
    })
    console.log(user);
    res.send(user);
})

app.get('/api/users/nationalNum/:national_number', async (req, res) => {
    var user = await db.users.findAll({
        where: {
            national_number: req.params.national_number
        }
    })
    console.log(user);
    res.send(user);
})

app.get('/api/users/fullArName/:full_arabic_name', async (req, res) => {
    var user = await db.users.findAll({
        where: {
            full_arabic_name: req.params.full_arabic_name
        }
    })
    console.log(user);
    res.send(user);
})

app.get('/api/users/mobile/:mobile_number', async (req, res) => {
    var user = await db.users.findAll({
        where: {
            mobile_number: req.params.mobile_number
        }
    })
    console.log(user);
    res.send(user);
})
//POST METHOD

app.post('/api/users', async (req, res) => {
    var r = await db.users.create({
        email: req.body.email,
        password: req.body.password,
        mobile_number: req.body.mobile,
        full_arabic_name: req.body.full_arabic_name,
        gender: req.body.gender,
        user_type: req.body.type
    })
    res.send(r);
});

app.put('/api/users/:user_id', async (req, res) => {
    var user = await db.users.findOne({
        where: {
            user_id: req.params.user_id
        }
    })
    user.update({
        email: req.body.email,
        password: req.body.password,
        mobile_number: req.body.mobile,
        full_arabic_name: req.body.full_arabic_name,
        gender: req.body.gender,
        user_type: req.body.type
    })
    res.send('row updated');
})

app.delete('/api/users/:user_id', async (req, res) => {
    var user = await db.users.findOne({
        where: {
            user_id: req.params.user_id
        }
    })
    user.destroy();
    res.send('row deleted')
})


//===============================================================
//BUSINESS TABLE
app.get('/api/business/', (req, res) => {
    db.business.findAll({
        include: [{
            model: db.users
        }]
    }).then((data) => {
        res.send(data);
    })
})

app.get('/api/business/:bussiness_id', async (req, res) => {
    var bussiness1 = await db.business.findOne({
        where: {
            bussiness_id: req.params.bussiness_id
        }
    })
    res.send(bussiness1);
})

app.get('/api/business/governorate/:hq_governorate', async (req, res) => {
    var hqBussiness = await db.business.findAll({
        where: {
            HQ_governorate: req.params.hq_governorate
        }
    })
    res.send(hqBussiness);
})

app.get('/api/business/activity/:bussiness_activity', async (req, res) => {
    var bussiness1 = await db.business.findAll({
        where: {
            bussiness_activity: req.params.bussiness_activity
        }
    })
    res.send(bussiness1);
})

app.post('/api/business/', (req, res) => {
    db.business.create({
        bussiness_name: req.body.bussiness_name,
        description: req.body.description,
        number_of_employees: req.body.number_of_employees,
        bussinesss_activity: req.body.bussiness_activity
    });
    res.send('row created');
})

app.put('/api/business/:bussiness_id', async (req, res) => {
    var bussiness1 = await db.business.findOne({
        where: {
            bussiness_id: req.params.bussiness_id
        }
    })
    bussiness1.update({
        bussiness_name: req.body.bussiness_name,
        description: req.body.description,
        number_of_employees: req.body.number_of_employees,
        bussinesss_activity: req.body.bussiness_activity
    })
    res.send('row updated');
})

app.delete('api/business/:bussiness_id', async (req, res) => {
    var bussiness1 = await db.business.findOne({
        where: {
            bussiness_id: req.params.bussiness_id
        }
    })
    bussiness1.destroy();
    res.send('row deleted')
})


//===========================================================
//PRODUCTS TABLE
app.get('/api/products', (req, res) => {
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



})

app.get('/api/products/:product_id', async (req, res) => {
    var product = await db.products.findOne({
        where: {
            product_id: req.params.product_id
        }
    })
    res.send(product)
})

app.get('/api/products/status/:pending_status', async (req, res) => {
    var product = await db.products.findAll({
        where: {
            pending_status: req.params.pending_status
        }
    })
    res.send(product)
})

app.get('/api/products/price/:unit_price', async (req, res) => {
    var product = await db.products.findAll({
        where: {
            unit_price: req.params.unit_price
        }
    })
    res.send(product)
})

app.get('/api/products/name/:product_name', async (req, res) => {
    var product = await db.products.findAll({
        where: {
            product_name: req.params.product_name
        }
    })
    res.send(product)
})

app.get('/api/products/productCode/:product_code', async (req, res) => {
    var product = await db.products.findAll({
        where: {
            product_code: req.params.product_code
        }
    })
    res.send(product)
})

app.get('/api/products/color/:color', async (req, res) => {
    var product = await db.products.findAll({
        where: {
            color: req.params.color
        }
    })
    res.send(product)
})

app.get('/api/products/hscode/:HS_code', async (req, res) => {

    var product = await db.products.findAll({
        where: {
            HS_code: req.params.HS_code
        }

    })
    res.send(product)

})

//POST METHOD

app.post('/api/products', (req, res) => {
    db.products.create({
        product_name: req.body.product_name,
        product_code: req.body.product_code,
        HS_code: req.body.HS_code,
        min_units_per_order: req.body.min_units_per_order,
        unit_price: req.body.unit_price,
        size: req.body.size,
        color: req.body.color,
        unit_weight: req.body.unit_weight,
        has_discount: req.body.has_discount,
        discount_amount: req.body.discount_amount,
        availability: req.body.availability,
        product_rating: req.body.product_rating
    })
    res.send('row created successfully')
})

//PUT METHOD

app.put('/api/products/:product_id', async (req, res) => {
    var product = await db.products.findOne({
        where: {
            product_id: req.params.product_id
        }
    })
    product.update({
        category: req.body.category,
        bussiness_id: req.body.bussiness_id,
        pending_status: req.body.pending_status,
        product_name: req.body.product_name,
        product_code: req.body.product_code,
        HS_code: req.body.HS_code,
        min_units_per_order: req.body.min_units_per_order,
        description: req.body.description,
        unit_price: req.body.unit_price,
        size: req.body.size,
        color: req.body.color,
        unit_weight: req.body.unit_weight,
        main_picture: req.body.main_picture,
        extra_picture1: req.body.extra_picture1,
        extra_picture2: req.body.extra_picture2,
        has_discount: req.body.has_discount,
        discount_amount: req.body.discount_amount,
        availability: req.body.availability,
        product_rating: req.body.product_rating

    })
    res.send("ROW UPDATED")
})

app.delete('/api/products/:product_id', async (req, res) => {
    var product = await db.products.findOne({
        where: {
            product_id: req.params.product_id
        }
    })
    product.destroy();
    res.send("ROW DELETED")
})



//=======================
//PRODUCT CATEGORIES

app.get('/api/product_categories', async (req, res) => {
    var product = await db.product_categories.findAll();
    res.send(product);
})

app.get('/api/product_categories_id/:category_id', async (req, res) => {
    var product = await db.product_categories.findOne({
        where: {
            category_id: req.params.category_id
        }
    })
    res.send(product);
})

app.get('/api/product_categories_name/:category_name', async (req, res) => {
    var product = await db.product_categories.findAll({
        where: {
            category_name: req.params.category_name
        }
    })
    res.send(product);

})
app.post('/api/product_categories', (req, res) => {
    db.product_categories.create({
        category_name: req.body.category_name,
        description: req.body.description,
        picture: req.body.picture,
        has_products: req.body.has_products
    })
    res.send("ROW CREATED SUCCESFULY");
})
app.put('/api/product_categories/:category_id', async (req, res) => {
    var product = await db.product_categories.findOne({
        where: {
            category_id: req.params.category_id
        }
    })
    product.update({
        category_name: req.body.category_name,
        description: req.body.description,
        picture: req.body.picture,
        has_products: req.body.has_products
    })
    res.send("ROW UPDATED")
})

app.delete('/api/product_categories/:category_id', async (req, res) => {
    var product = await db.product_categories.findOne({
        where: {
            category_id: req.params.category_id
        }
    })
    product.destroy();
    res.send("ROW DELETED");

})

//=================
//  REQUESTS TABLE

app.post('/api/recievedRequests', (req, res) => {
    db.users.findOne({
        where: {
            user_id: req.body.user_id
        },
        include: [{
            model: db.requests,
            as: "recievedRequests",
            include: [{
                    model: db.products,
                },
                {
                    model: db.users,
                    as: 'sendingUser'
                }
            ],

        }]
    }).then(response => {
        return res.send(response);
    });

})

app.post('/api/sentRequests', (req, res) => {
    db.users.findOne({
        where: {
            user_id: req.body.user_id
        },
        include: [{
            model: db.requests,
            as: "sentRequests",
            include: [{
                    model: db.products,
                },
                {
                    model: db.users,
                    as: 'recievingUser'
                }
            ],

        }]
    }).then(response => {
        return res.send(response);
    });
})

app.get('/api/requests/:requests_id', async (req, res) => {
    var request = await db.requests.findOne({
        where: {
            requests_id: req.params.requests_id
        }
    })
    res.send(request);
})

app.get('/api/requests_user_id/:by_user_id', async (req, res) => {
    var request = await db.requests.findOne({
        where: {
            by_user_id: req.params.by_user_id
        }
    })
    res.send(request);
})
app.get('/api/requests_number/:request_number', async (req, res) => {
    var request = await db.requests.findOne({
        where: {
            request_number: req.params.request_number
        }
    })
    res.send(request);
})


app.put('/api/requests/:requests_id', async (req, res) => {
    var request = await db.requests.findOne({
        where: {
            requests_id: req.params.requests_id
        }
    })
    request.update({
        by_user_id: req.body.by_user_id,
        to_user_id: req.body.to_user_id,
        request_number: req.body.request_number,
        request_status: req.body.request_status,
        request_details: req.body.request_details,
        request_date: req.body.request_date

    })
    res.send("ROW UPDATED");
})


app.post('/api/requests', (req, res) => {
    db.requests.create({
        by_user_id: req.body.by_user_id,
        to_user_id: req.body.to_user_id,
        request_number: req.body.request_number,
        request_status: req.body.request_status,
        request_details: req.body.request_details,
        request_date: req.body.request_date

    })
    res.send("ROW ADDED");
})

app.delete('/api/requests/:requests_id', async (req, res) => {
    var request = await db.requests.findOne({
        where: {
            requests_id: req.params.requests_id
        }
    })
    request.destroy();
    res.send("ROW DELETED");
})



























app.listen(3000, () => {
    console.log('listening on port 3000');
})