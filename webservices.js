const express = require('express');
const db = require('./database');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const cors = require('cors')
const path = require("path")
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const randomstring = require('randomstring')
const multer = require('multer')
const stripe = require('stripe')('sk_test_51H97oICdSDXTIUwz1HsESGMmCODSWE7Ct0hUQ1sRzeSU1rEi0qS5x6n0SYdUmoiXjQeMQAB58xDuvsWp0XjuT2sk00DAVbX0l9')

var cartItems;

var imagedir = path.join(__dirname, '/allUploads/');
app.use(express.static(imagedir));

const storage = multer.diskStorage({
    destination: './allUploads/uploads/',

    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now() + '.jpg')
    }
});


require("dotenv").config();
const upload = multer({
    storage: storage
})

var storage2 = multer.diskStorage({
    destination: './allUploads/productImages',
    filename: function (req, file, cb) {
        cb(null, 'Image-' + Date.now() + ".jpg");
    }
});
const upload2 = multer({
    storage: storage2
});


var hash = crypto.randomBytes(10).toString('hex');
// var hash=randomstring.generate(5);
var cryptoo = randomstring.generate(10)
console.log(cryptoo);

// const exphbs = requrie('express-handlebars')

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cors());


app.set('view engine', 'handlebars');

const token = crypto.randomBytes(20).toString('hex');
var hashLink = 'http://localhost:8080/updateForgottenPassword/' + token;

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'miroayman6198@gmail.com',
        pass: 'eshta123'
    }
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});


//====================================
// app.post('/api/image',upload.array("file"),(req,res,next)=>{
//     console.log("The IMAGEs are :",req.files)
//     res.json({
//         file:req.files
//     })
//     db.business.create({
//         commercial_register:req.files[0].path,
//         tax_card:req.files[1].path,
//         operating_license:req.files[2].path


//     })
// })

app.post('/api/profilePhoto', upload.single("profile"), async (req, res, next) => {
    console.log("The Image is: ", req.file)

    var user = await db.users.findOne({
        where: {
            email: req.body.email
        }
    })
    if (!user) {
        console.log("User is not found ===================")
        res.json({
            message: "Error happened"
        })
    } else {
        user.update({
            profile_photo: req.file.path.substr(11)

        })
        res.json({
            data: user.profile_photo,
            message: "Image Uploaded to database"
        })

        console.log("Image Path =======================", user.profile_photo)
    }
})







app.post('/api/businessOwnerData', upload.array("file"), async (req, res, next) => {
    console.log("The IMAGES are :", req.files)

    db.business.create({
        user_id: req.body.user_id,
        enterprice_national_number: req.body.enterprice_national_number,
        bussiness_name: req.body.bussiness_name,
        bussiness_activity: req.body.bussiness_activity,
        commercial_register: req.files[0] ? req.files[0].path.substr(11) : null,
        tax_card: req.files[1] ? req.files[1].path.substr(11) : null,
        operating_license: req.files[2] ? req.files[2].path.substr(11) : null

    })
    res.json({
        message: "You are now a Business owner",
        data: req.files
    })
    var user = await db.users.findOne({
        where: {
            email: req.body.email
        }

    })

    if (!user) res.json({
        message2: "User not found"
    })

    user.update({
        full_arabic_name: req.body.full_arabic_name,
        national_number: req.body.national_number,
        job: req.body.job,
        fax: req.body.fax,
        address: req.body.address,
        website: req.body.website,
        mobile_number: req.body.mobile_number,
        user_type: "business"


    })
    res.json({
        user: user
    })
    console.log(user)


})














//=============================================
//LOGIN WEBSERVICE





app.post('/api/login', (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.send('please enter email and password')
    }
    var user = db.users.findOne({
        where: {
            email: req.body.email
        },
        include: [{
            model: db.business
        }]
    }).then(user => {

        if (user) {
            if (user.active == 0) {
                return res.send("Please activate your account")
            } else if (user.active == 1) {
                if (user == null) {
                    return res.json({
                        message: 'wrong email'
                    })
                };
            }
            // if (req.body.password != user.password) {
            //     return res.send('wrong password')
            //     console.log(user.password , "======================")
            // }
            if (user.password == req.body.password) {
                res.json({
                    message: "authenitcation succesfull",
                    data: user
                });
                console.log(user)

            } else {
                res.send("Password doesnt match")
            }
        } else {
            res.send("Please Signup first")
        }
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
app.post('/api/signup', async (req, res) => {



    // bcrypt.hash(req.body.password, 10, (err, hash) => {
    //     if (err) {
    //         return res.status(500).send(err);
    //     } else {


    var user = await db.users.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {

        if (!user) {

            // sending email to req.body
            const token = jwt.sign(req.body.email, process.env.JWT_KEY, {
                expiresIn: '60m'
            }, (emailtoken, err) => {
                const url = `http://localhost:8080/activation/` + cryptoo;

                let transporter = nodemailer.createTransport({
                    service: "gmail",

                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: 'alphieethan@gmail.com', // generated ethereal user
                        pass: '4523534m', // generated ethereal password
                    },
                    tls: {
                        regectUnauthorized: false
                    }
                });





                let mailOptions = {
                    from: ' alphieethan@gmail.com', // sender address
                    to: req.body.email, // list of receivers
                    subject: "Project almost DONE", // Subject line
                    text: "Please activate from here", // plain text body
                    html: `  <a href="${url}">Click to ACTIVATE</a> <br/>
       
        `


                };
                transporter.sendMail(mailOptions, function (data, err) {
                    if (err) {
                        console.log("error happened")
                    } else {
                        console.log("email sent!!!!")
                    }
                })
            });
            // Creating record in DATABASE
            db.users.create({
                email: req.body.email,
                national_number: req.body.national_number,
                password: hash,
                mobile_number: req.body.mobile_number,
                full_arabic_name: req.body.full_arabic_name,
                gender: req.body.gender,
                crypto: cryptoo


            })
            return res.json({
                message: "a message is sent to your email , please verify "
            });
        } else {
            return res.json({
                message: "user already exists"
            });
        }
    })
        .catch(err => {
            console.log(err)
        })
})



//===========================================
//Complete Data
app.put("/api/completedata", async (req, res) => {
    var user = await db.users.findOne({
        where: {
            email: req.body.email
        }
    })

    user.update({
        national_number: req.body.national_number,
        gender: req.body.gender,
        full_arabic_name: req.body.full_arabic_name,
        full_english_name: req.body.full_english_name,
        birthdate: req.body.birthdate,
        qualifications: req.body.qualifications,
        job: req.body.job,
        governorate: req.body.governorate,
        village: req.body.village,
        center: req.body.center,
        phone_number: req.body.phone_number,
        mobile_number: req.body.mobile_number,
        fax: req.body.fax,
        facebook_account: req.body.facebook_account,
        linkedin: req.body.linkedin,
        website: req.body.website,
        address: req.body.address
    })
    res.json({
        message: "user successfully UPDATED",
        data: user
    })

    res.send(user)
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

//============ Activation
app.put('/api/activate', async (req, res) => {

    var user = await db.users.findOne({
        where: {
            crypto: cryptoo
        }
    })

    if (user) {

        user.update({
            active: 1
        })
        res.send("User activated")
    } else {
        res.send("Some thing went wrong!!!!!")
    }
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



});

app.post('/api/myProducts', (req, res) => {
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

app.post('/api/product', upload2.array('file', 12), (req, res, next) => {
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

app.post('/api/updateProduct', upload2.array('file', 12), (req, res, next) => {
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

app.delete('/api/removeProduct/:product_id', (req, res) => {
    db.products.findOne({
        where: {
            product_id: req.params.product_id
        }
    }).then(product => {
        product.destroy();
        res.send("ROW DELETED")
    })

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


app.post('/api/sendRequest', (req, res) => {
    db.requests.create({
        by_user_id: req.body.by_user_id,
        to_user_id: req.body.to_user_id,
        request_details: req.body.request_details,
        request_date: req.body.request_date,
        product_id: req.body.product_id,
        request_status: 'pending'

    });

    // var mailOptions = {
    //     from: 'miroayman6198@gmail.com',
    //     to: req.body.email,
    //     subject: 'new request for you',
    //     text: 'لقد قام صاحب مشروع بارسال طلب لك بيانات الطلب: ' + req.body.request_details
    // };

    // transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log('Email sent: ' + info.response);
    //     }
    // });

    res.status(200).send(" ROW ADDED");
});

app.post('/api/sendRequestResponse', (req, res) => {
    db.requests.findOne({
        where: {
            requests_id: req.body.requests_id
        }
    }).then(request => {
        if (!request) {
            res.send('request not found');
            return
        }
        request.update({
            request_response: req.body.request_response
        })
        res.send('response added successfully')
    })
})

app.delete('/api/requests/:requests_id', async (req, res) => {
    var request = await db.requests.findOne({
        where: {
            requests_id: req.params.requests_id
        }
    })
    request.destroy();
    res.send("ROW DELETED");
});

app.post('/api/checkout', (req, res) => {
    var itemsArray = [];

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
            var map = products.map((e) => { return e.product })

            map.forEach((element, index) => {
                const data = {};
                data.amount = element.unit_price * 100;
                data.name = element.product_name;
                data.currency = 'usd';
                data.quantity = req.body.quantityArray[index];
                itemsArray.push(data);
            })

            stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                success_url: 'http://localhost:8080/home',
                cancel_url: 'https://example.com/cancel',
                line_items: itemsArray,

            }).then((session) => {
                res.json({
                    session_id: session.id
                })
            });

        })
    })




})

// Cart TABLE =======================


app.post('/api/cart', async (req, res) => {
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



app.post('/api/table', async (req, res) => {

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
    }).then((product) => { product.update({ in_cart: 1 }) })


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


        }
        else {
            res.json({ message: "product exists" })
        }
    })




    //  db.products.findOne({
    //     where:{
    //         product_id:req.body.product_id
    //     }
    // }).then((product)=>{
    //     product.update({
    //         cart_id:cart.cart_id
    //     })
    // })



})

app.put('/api/getProducts', (req, res) => {
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
            var map = products.map((e) => { return e.product })
            cartItems = map;
            res.json({ data: map })
        })
    })

})

app.put('/api/remove', (req, res) => {
    db.cart_products.findOne({
        where: {
            product_id: req.body.product_id
        }
    }).then((product) => {
        product.destroy()
        res.send("product removed")
    })

})


app.listen(3000, () => {
    console.log('listening on port 3000');
})