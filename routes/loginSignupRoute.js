const express = require('express');
const router = express.Router();
const db = require('../database');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
var hash = crypto.randomBytes(10).toString('hex');
const bodyParser = require('body-parser');
const cors = require('cors')
router.use(bodyParser.json());
router.use(cors());
const jwt = require("jsonwebtoken");

const cryptoo = crypto.randomBytes(10).toString('hex');
//=============================================
//LOGIN/SIGNUP/ACTIVATION/COMPLETEDATA WEBSERVICE

router.post('/api/login', (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.send('please enter email and password')
    }
    db.users.findOne({
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
                governorate:req.body.governorate,
                region:req.body.region


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


router.put('/api/activate', async (req, res) => {

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


module.exports = router;