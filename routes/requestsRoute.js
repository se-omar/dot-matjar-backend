const express = require('express');
const db = require('../database');
const router = express.Router();
const nodemailer = require('nodemailer');
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


//=================
//  REQUESTS TABLE

router.post('/api/recievedRequests', (req, res) => {
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

router.post('/api/sentRequests', (req, res) => {
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




router.post('/api/sendRequest', (req, res) => {
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

router.post('/api/sendRequestResponse', (req, res) => {
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

router.delete('/api/requests/:requests_id', async (req, res) => {
    var request = await db.requests.findOne({
        where: {
            requests_id: req.params.requests_id
        }
    })
    request.destroy();
    res.send("ROW DELETED");
});


module.exports = router;
