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

const storage = multer.diskStorage({
    destination: './allUploads/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now() + '.jpg')
    }
})
const upload = multer({
    storage: storage
})
var imagedir = path.join(__dirname.substr(0, __dirname.length - 6), '/allUploads/');
router.use(express.static(imagedir));

const carouselStorage = multer.diskStorage({
    destination: './allUploads/carousel_images/',
    filename: function (req, file, cb) {
        cb(null, file.originalname.substr(0, file.originalname.length - 3) + Date.now() + '.jpg')
    }
})
const carouselUpload = multer({
    storage: carouselStorage
})

const bannerStorage = multer.diskStorage({
    destination: './allUploads/banner_images/',
    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now() + '.jpg')
    }
})
const bannerUpload = multer({
    storage: bannerStorage
})


router.post('/api/updateSupplierPage', upload.single('file'), async (req, res) => {
    var file = req.file;
    var wh = {}

    wh.show_carousel = req.body.showCarousel;
    wh.show_left_banner = req.body.showLeftBanner;
    wh.show_right_banner = req.body.showRightBanner;
    if (req.body.facebook) { wh.facebook = req.body.facebook }
    if (req.body.instgram) { wh.instgram = req.body.instgram }
    if (req.body.linkedin) { wh.linkedin = req.body.linkedin }
    if (req.body.twitter) { wh.twitter = req.body.twitter }
    if (req.body.siteName) { wh.site_name = req.body.siteName }
    if (req.body.google) { wh.google = req.body.google }
    if (req.body.user_id) { wh.user_id = req.body.user_id }
    if (file) { wh.logo = req.file.path.substr(11) }
    if (req.body.footer) { wh.footer = req.body.footer }
    if (req.body.carousel_width) { wh.carousel_width = req.body.carousel_width }
    if (req.body.carousel_height) { wh.carousel_height = req.body.carousel_height }
    if (req.body.user_id) { wh.user_id = req.body.user_id }

    console.log('wherer statement =========================================================================================', wh)
    console.log('show carousel', req.body.showCarousel)
    var page = await db.supplier_page_info.findOne({
        where: {
            user_id: req.body.supplier_id
        }
    })

    if (!page) {
        db.supplier_page_info.create({
            facebook: req.body.facebook,
            instgram: req.body.instgram,
            linkedin: req.body.linkedin,
            twitter: req.body.twitter,
            site_name: req.body.siteName,
            google: req.body.google,
            user_id: req.body.user_id,
            logo: req.file.path.substr(11),
            footer: req.body.footer,
            user_id: req.body.supplier_id,
            show_carousel: req.body.showCarousel ? 1 : 0,
            show_left_banner: req.body.showLeftBanner ? 1 : 0,
            show_right_banner: req.body.showRightBanner ? 1 : 0,
            carousel_width: req.body.carousel_width ? req.body.carousel_width : 10,
            carousel_height: req.body.carousel_height ? req.body.carousel_height : 400
        }).then(page => {
            res.json({ messaage: 'Page created', data: page })
        }).catch(err => { console.log(err) })


    }
    else {
        console.log('wherer statement', wh)
        page.update(wh).then(page => {
            res.json({ messaage: 'Page Updated', data: page })
        }).catch(err => { console.log(err) })
    }

})

router.post('/api/uploadCarouselImages', carouselUpload.array('file', 12), (req, res) => {
    console.log('supplier id is ===============================================================================', req.files)
    var wh = {}
    if (req.files[0]) { wh.carousel_image_1 = req.files[0].path.substr(11) }
    if (req.files[1]) { wh.carousel_image_2 = req.files[1].path.substr(11) }
    if (req.files[2]) { wh.carousel_image_3 = req.files[2].path.substr(11) }
    if (req.files[3]) { wh.carousel_image_4 = req.files[3].path.substr(11) }

    db.supplier_page_info.findOne({
        where: {
            user_id: req.body.supplier_id,
        },
    }).then(info => {
        if (wh !== {}) {
            info.update(wh).then(row => {
                res.send(row)
            })
        }
    })

})

router.post('/api/uploadBannerImages', bannerUpload.array('file', 12), (req, res) => {
    db.supplier_page_info.findOne({
        where: {
            user_id: req.body.supplier_id,
        },
    }).then(info => {
        if (req.files[0] && req.files[0].originalname === 'left') {
            info.update({
                left_banner_image: req.files[0] ? req.files[0].path.substr(11) : info.left_banner_image,
                right_banner_image: req.files[1] ? req.files[1].path.substr(11) : info.right_banner_image,
            }).then(row => {
                res.send(row)
            })
        }
        else {
            info.update({
                right_banner_image: req.files[0] ? req.files[0].path.substr(11) : info.right_banner_image,
                left_banner_image: req.files[1] ? req.files[1].path.substr(11) : info.left_banner_image,
            }).then(row => {
                res.send(row)
            })
        }
    })
})

router.post('/api/removeCarouselImage', (req, res) => {
    db.supplier_page_info.findOne({
        where: {
            user_id: req.body.id
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

router.post('/api/removeBannerImage', (req, res) => {
    db.supplier_page_info.findOne({
        where: {
            user_id: req.body.id
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




router.put('/api/getSupplierPageData', (req, res) => {
    console.log(req.supplier_id)
    db.supplier_page_info.findOne({
        where: {
            user_id: req.body.supplier_id
        }
    }).then(info => {
        res.json({ message: 'data is ', data: info })
    })

})

module.exports = router