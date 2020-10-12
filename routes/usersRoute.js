const express = require('express');
const router = express.Router();
const db = require('../database');
const nodemailer = require('nodemailer');
const path = require("path")
const multer = require('multer')
const bodyParser = require('body-parser');
const cors = require('cors')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const checkAuth = require('./check-auth');
const { where } = require('sequelize');


router.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

router.use(cors());



const storage = multer.diskStorage({
    destination: './allUploads/uploads/',

    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now() + '.jpg')
    }
});


var imagedir = path.join(__dirname, '/allUploads/');
router.use(express.static(imagedir));

const upload = multer({
    storage: storage
})


//==============================================
//USERS TABLE

router.post('/api/profilePhoto', upload.single("profile"), async (req, res, next) => {
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
        console.log('User profile', user.profile_photo)
        res.json({
            data: user.profile_photo,
            message: "Image Uploaded to database"
        })

        console.log("Image Path =======================", user.profile_photo)
    }
})

router.post('/api/businessOwnerData', upload.array("file"), async (req, res, next) => {
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

router.post('/api/getSuppliers', (req, res) => {
    console.log(req.body.user_id)
    if (!req.body.user_id) {
        db.users.findAll({
            where: {
                user_type: 'business'
            },
            limit: 10
        }).then(users => {
            res.json({
                users: users
            })
        })
    }
    else {
        console.log('entered here')
        db.users.findAll({
            where: {
                user_id: {
                    [Op.gt]: req.body.user_id
                },
                user_type: 'business'
            },
            limit: 10
        }).then(users => {
            res.json({
                users: users
            })
        })
    }
})

router.post('/api/refreshCurrentUser', checkAuth, (req, res) => {
    db.users.findOne({
        where: {
            user_id: req.userData.user_id
        }
    }).then(user => {
        if (!user) {
            return res.json({
                message: 'user not found',
            })
        }

        res.json({
            message: 'user sent successfully',
            user: user
        })
    })
})



router.put('/api/changeSiteColor', async (req, res) => {
    console.log(req.body.user_id)
    db.users.findOne({
        where: {
            user_id: req.body.user_id
        }
    }).then(async user => {
        if (user.user_type != 'admin') { res.json({ message: 'You have no access for this request' }) }
        else {
            var admins = await db.users.findAll({
                where: {
                    user_type: 'admin'
                }
            })

            for (let i = 0; i < admins.length; i++) {
                await db.users.findOne({
                    where: {
                        user_id: admins[i].user_id
                    }
                }).then(user => {
                    user.update({
                        site_color: req.body.site_color
                    })
                })
            }
            res.json({ message: 'site color changed' },

            )
        }

    })
})



router.put('/api/getSiteColor', async (req, res) => {
    db.site_colors.findAll()
        .then(data => { res.json({ data: data, message: 'site data connected' }) })
})






router.post('/api/updateSiteColors', async (req, res) => {
    var siteColor = await db.site_colors.findOne({
        where: {
            id: 1
        }
    })
    if (!siteColor) {
        db.site_colors.create({
            toolbar_color: req.body.toolBarColor,
            footer_color: req.body.footerColor,
            footer_text_color: req.body.footerTextColor,
            button_color: req.body.buttonsColor,
            button_text_color: req.body.buttonTextColor,
            toolbar_text_color: req.body.toolBarTextColor
        })
    }
    if (siteColor) {
        db.site_colors.findOne({
            where: {
                id: 1
            }
        }).then(siteUpdates => {
            siteUpdates.update({
                toolbar_color: req.body.toolBarColor,
                footer_color: req.body.footerColor,
                footer_text_color: req.body.footerTextColor,
                button_color: req.body.buttonsColor,
                button_text_color: req.body.buttonsTextColor,
                toolbar_text_color: req.body.toolBarTextColor
            })
        })
    }
})







// router.get('/api/users', async (req, res) => {
//     await db.users.findAll({
//         include: [{
//             model: db.business
//         }]
//     }).then((data) => {
//         res.send(data);
//     })
// })

// router.get('/api/users/:user_id', async (req, res) => {
//     var user = await db.users.findOne({
//         where: {
//             user_id: req.params.user_id
//         }
//     })
//     console.log(user);
//     res.send(user);
// })

// router.get('/api/users/type/:user_type', async (req, res) => {
//     var user = await db.users.findAll({
//         where: {
//             user_type: req.params.user_type
//         }
//     })
//     console.log(user);
//     res.send(user);
// })

// router.get('/api/users/email/:email', async (req, res) => {
//     var user = await db.users.findAll({
//         where: {
//             email: req.params.email
//         }
//     })
//     console.log(user);
//     res.send(user);
// })

// router.get('/api/users/nationalNum/:national_number', async (req, res) => {
//     var user = await db.users.findAll({
//         where: {
//             national_number: req.params.national_number
//         }
//     })
//     console.log(user);
//     res.send(user);
// })

// router.get('/api/users/fullArName/:full_arabic_name', async (req, res) => {
//     var user = await db.users.findAll({
//         where: {
//             full_arabic_name: req.params.full_arabic_name
//         }
//     })
//     console.log(user);
//     res.send(user);
// })

// router.get('/api/users/mobile/:mobile_number', async (req, res) => {
//     var user = await db.users.findAll({
//         where: {
//             mobile_number: req.params.mobile_number
//         }
//     })
//     console.log(user);
//     res.send(user);
// })
// //POST METHOD

// router.post('/api/users', async (req, res) => {
//     var r = await db.users.create({
//         email: req.body.email,
//         password: req.body.password,
//         mobile_number: req.body.mobile,
//         full_arabic_name: req.body.full_arabic_name,
//         gender: req.body.gender,
//         user_type: req.body.type
//     })
//     res.send(r);
// });

// router.put('/api/users/:user_id', async (req, res) => {
//     var user = await db.users.findOne({
//         where: {
//             user_id: req.params.user_id
//         }
//     })
//     user.update({
//         email: req.body.email,
//         password: req.body.password,
//         mobile_number: req.body.mobile,
//         full_arabic_name: req.body.full_arabic_name,
//         gender: req.body.gender,
//         user_type: req.body.type
//     })
//     res.send('row updated');
// })


// router.delete('/api/users/:user_id', async (req, res) => {
//     var user = await db.users.findOne({
//         where: {
//             user_id: req.params.user_id
//         }
//     })
//     user.destroy();
//     res.send('row deleted')
// })



module.exports = router;