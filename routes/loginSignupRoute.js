const express = require('express');
const router = express.Router();
const db = require('../database');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
var hash = crypto.randomBytes(10).toString('hex');
const bodyParser = require('body-parser');
const cors = require('cors')

router.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

router.use(cors());
const jwt = require("jsonwebtoken");

const cryptoo = crypto.randomBytes(10).toString('hex');
//=============================================
//LOGIN/SIGNUP/ACTIVATION/COMPLETEDATA WEBSERVICE

router.post('/api/login', (req, res) => {
    db.users.findOne({
        where: {
            email: req.body.email
        },
        include: [{
            model: db.business
        }]
    }).then(user => {
        if (!user) {
            return res.json({ message: 'please sign up first' })
        }
        if (user.active == 0) {
            return res.json({ message: 'Please activate your account' })
        }
        if (user.password != req.body.password) {
            return res.json({ message: 'authentication failed' })
        }

        jwt.sign({
            user_id: user.user_id,
            user_email: user.email
        }, 'secret', (err, token) => {
            return res.json({
                message: 'authentication successful',
                token: token
            })
        })





        // if (user) {
        //     if (user.active == 0) {
        //         return res.send("Please activate your account")
        //     } else if (user.active == 1) {
        //         if (user == null) {
        //             return res.json({
        //                 message: 'wrong email'
        //             })
        //         };
        //     }

        //     if (user.password == req.body.password) {
        //         res.json({
        //             message: "authenitcation succesfull",
        //             data: user
        //         });
        //         console.log(user)

        //     } else {
        //         res.send("Password doesnt match")
        //     }
        // } else {
        //     res.send("Please Signup first")
        // }
    });

});


router.post('/api/signup', async (req, res) => {



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
                var url = `http://localhost:8080/activation/` + cryptoo;

                let transporter = nodemailer.createTransport({
                    service: "gmail",

                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: 'dotmarketofficial@gmail.com', // generated ethereal user
                        pass: 'dotmarket123', // generated ethereal password
                    },
                    tls: {
                        regectUnauthorized: false
                    }
                });





                let mailOptions = {
                    from: 'DOT-MATJAR', // sender address
                    to: req.body.email, // list of receivers
                    subject: "Project almost DONE", // Subject line
                    text: "Please activate from here", // plain text body
                    html: `  <a href="${url}">Click to ACTIVATE</a> <br/>
       
        `


                };
                transporter.sendMail(mailOptions, function (data, err) {
                    if (err) {
                        console.log("error hrouterened")
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
                crypto: cryptoo,
                governorate: req.body.governorate,
                region: req.body.region


            }).then(res.json({ message: 'A Message is sent to your Email' }))
            // return res.json({
            //     message: "a message is sent to your email , please verify "

            // });
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


router.put("/api/completedata", async (req, res) => {
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


router.put('/api/activateUserAccount', async (req, res) => {

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
        console.log("user activated")
    } else {
        res.send("Some thing went wrong!!!!!")
        console.log("something went wrong")
    }
})


router.post('/api/businessOwnerRegistration', async (req, res) => {
    console.log(req.body.email)
    var checkEmail = await db.users.findOne({
        where: {
            email: req.body.email
        }
    })


    if (checkEmail) { res.json({ message: 'Email already exists' }) }
    else {
        const token = jwt.sign(req.body.email, process.env.JWT_KEY, {
            expiresIn: '60m'
        }, (emailtoken, err) => {
            var url = `http://localhost:8080/activation/` + cryptoo;

            let transporter = nodemailer.createTransport({
                service: "gmail",

                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'dotmarketofficial@gmail.com', // generated ethereal user
                    pass: 'dotmarket123', // generated ethereal password
                },
                tls: {
                    regectUnauthorized: false
                }
            });





            let mailoptions = {
                from: ' dotmarketofficial@gmail.com', // sender address
                to: req.body.email, // list of receivers
                subject: "account almost DONE", // Subject line
                text: "Please activate from here", // plain text body
                html: `  <a href="${url}">Click to ACTIVATE your account</a> <br/>
   
    `

            };



            transporter.sendMail(mailoptions, function (err) {
                if (err) {

                    console.log('err', err)
                    res.json({ message: 'Failed' })
                } else {
                    console.log("email sent!!!!")
                    res.json({ message: 'Verification message is sent to your email' })

                    db.users.create({
                        email: req.body.email,
                        national_number: req.body.national_number,
                        password: hash,
                        mobile_number: req.body.mobile_number,
                        full_arabic_name: req.body.full_arabic_name,
                        gender: req.body.gender,
                        crypto: cryptoo,
                        governorate: req.body.governorate,
                        region: req.body.region,
                        user_type: 'waiting_approval',
                        store_name: req.body.store_name


                    }).then(
                        res.json({ message: 'A Message is sent to your Email' })

                    )

                }
            })


        });





    }




})





module.exports = router;