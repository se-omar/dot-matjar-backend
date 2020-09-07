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

router.post('/api/updateSupplierPage', upload.single('file'), async (req, res) => {
    var file = req.file;
    var wh = []


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
            carousel_width: req.body.carousel_width,
            carousel_height: req.body.carousel_height
        }).then(page => {
            res.json({ messaage: 'Page created', data: page })
        }).catch(err => { console.log(err) })


    }
    else {
        page.update(wh).then(page => {
            res.json({ messaage: 'Page Updated', data: page })
        }).catch(err => { console.log(err) })
    }

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