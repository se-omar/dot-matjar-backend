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
const fs = require('fs')



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


const carouselStorage = multer.diskStorage({
    destination: './allUploads/home_carousel/',
    filename: function (req, file, cb) {
        cb(null, file.originalname.substr(0, file.originalname.length - 3) + Date.now() + '.jpg')
    }
})
const carouselUpload = multer({
    storage: carouselStorage
})

const bannerStorage = multer.diskStorage({
    destination: './allUploads/home_banner/',
    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now() + '.jpg')
    }
})
const bannerUpload = multer({
    storage: bannerStorage
})



const profileStorage = multer.diskStorage({
    destination: './allUploads/profile_pictures/',
    filename: function (req, file, cb) {
        cb(null, file.originalname.substr(0, file.originalname.length - 3) + Date.now() + '.jpg')
    }
})
const profileUpload = multer({
    storage: profileStorage
})


router.post('/api/updateHomePage', async (req, res) => {
    var wh = {}
    console.log('carousel width', req.body.carousel_width)
    console.log('carousel height', req.body.carousel_height)
    wh.show_carousel = req.body.show_carousel;
    // wh.show_left_banner = req.body.showLeftBanner;
    wh.show_right_banner = req.body.show_right_banner;
    if (req.body.carousel_width) { wh.carousel_width = req.body.carousel_width }
    if (req.body.carousel_height) { wh.carousel_height = req.body.carousel_height }

    console.log('wherer statement =========================================================================================', wh)
    db.site_colors.findOne({
        where: {
            Id: 1
        }
    }).then(page => {
        page.update(wh).then(page => {
            res.json({ messaage: 'Page Updated', data: page })
        }).catch(err => { console.log(err) })
    })

})



router.post('/api/uploadHomeCarouselImages', carouselUpload.array('file', 12), (req, res) => {
    console.log('supplier id is ===============================================================================', req.files)
    var wh = {}
    if (req.files[0]) { wh.carousel_image_1 = req.files[0].path.substr(11) }
    if (req.files[1]) { wh.carousel_image_2 = req.files[1].path.substr(11) }
    if (req.files[2]) { wh.carousel_image_3 = req.files[2].path.substr(11) }
    if (req.files[3]) { wh.carousel_image_4 = req.files[3].path.substr(11) }

    db.site_colors.findOne({
        where: {
            Id: 1,
        },
    }).then(info => {
        if (wh !== {}) {
            info.update(wh).then(row => {
                res.send(row)
            })
        }
    })

})



router.post('/api/uploadHomeBannerImages', bannerUpload.array('file', 12), (req, res) => {
    db.site_colors.findOne({
        where: {
            Id: 1
        },
    }).then(info => {
        info.update({
            right_banner_image: req.files[0] ? req.files[0].path.substr(11) : info.right_banner_image,
        }).then(row => {
            res.send(row)
        })
        // if (req.files[0] && req.files[0].originalname === 'left') {
        //     info.update({
        //         left_banner_image: req.files[0] ? req.files[0].path.substr(11) : info.left_banner_image,
        //         right_banner_image: req.files[1] ? req.files[1].path.substr(11) : info.right_banner_image,
        //     }).then(row => {
        //         res.send(row)
        //     })
        // }
        // else {
        //     info.update({
        //         right_banner_image: req.files[0] ? req.files[0].path.substr(11) : info.right_banner_image,
        //         left_banner_image: req.files[1] ? req.files[1].path.substr(11) : info.left_banner_image,
        //     }).then(row => {
        //         res.send(row)
        //     })
        // }
    })
})

router.post('/api/removeHomeCarouselImage', (req, res) => {
    db.site_colors.findOne({
        where: {
            Id: 1
        }
    }).then(row => {
        row.update({
            [req.body.imgName]: null
        })
        res.json({
            row
        })
    })
})

router.post('/api/removeHomeBannerImage', (req, res) => {
    db.site_colors.findOne({
        where: {
            Id: 1
        }
    }).then(row => {
        row.update({
            [req.body.imgName]: null
        })
        res.json({
            row
        })
    })
})


router.put('/api/getHomePageData', (req, res) => {
    console.log(req.supplier_id)
    db.site_colors.findOne({
        where: {
            Id: 1
        }
    }).then(info => {
        res.json({ message: 'data is ', data: info })
    })

})

router.post('/api/addCountry', async (req, res) => {
    console.log(req.body.country.country)
    var checkIfCountryExists = await db.available_countries.findOne({
        where: {
            country_name: req.body.country.country
        }
    })
    if (checkIfCountryExists) {
        res.json({ message: 'Country already exists' })
    }
    else {
        db.available_countries.create({
            country_name: req.body.country.country
        }).then(res.json({ message: 'Country is Added Successfully' }))
    }

})


router.put('/api/getWorldCountries', (req, res) => {

    var region
    fs.readFile('./worldCountries.json', 'utf8', (err, data) => {
        if (err) {
            res.send('error')
        }
        else {
            var obj = JSON.parse(data);


            res.json({ data: obj })
            console.log(obj)
        }
    })

})

router.put('/api/getChoosenWorldCountries', (req, res) => {
    db.available_countries.findAll().then(countries => { res.json({ data: countries }) })
})

router.put('/api/removeCountry', (req, res) => {
    console.log(req.body.country)
    db.available_countries.findOne({
        where: {
            country_name: req.body.country
        }
    }).then(country => {
        country.destroy()
        res.json({ message: 'Country Removed Successfully' })
    })
})

router.post('/api/addNewUser', profileUpload.single('file'), (req, res) => {
    db.users.create({
        full_arabic_name: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        governorate: req.body.governorate,
        region: req.body.region,
        user_type: req.body.userType,
        gender: req.body.gender,
        facebook_account: req.body.facebook,
        mobile_number: req.body.mobileNumber,
        store_name: req.body.storeName,
        profile_photo: req.file ? req.file.path.substr(11) : null
    }).then(user => {
        res.json({
            data: user,
            message: 'user created successfully'
        })
    })
})

module.exports = router;