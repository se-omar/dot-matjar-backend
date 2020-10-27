const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const crypto = require('crypto');
//const faker = require('faker');
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const db = require('./database');




const usersRoute = require('./routes/usersRoute.js');
app.use(usersRoute);

const productsRoute = require('./routes/productsRoute.js');
app.use(productsRoute);

const loginSignupRoute = require('./routes/loginSignupRoute.js');
app.use(loginSignupRoute);

const passwordUpdateRoute = require('./routes/passwordUpdateRoute.js');
app.use(passwordUpdateRoute);

const requestsRoute = require('./routes/requestsRoute.js');
app.use(requestsRoute);

const cartRoute = require('./routes/cartRoute.js');
app.use(cartRoute);

const ordersRoute = require('./routes/ordersRoute.js');
app.use(ordersRoute);

const dashboardRoute = require('./routes/dashboardRoute.js');
app.use(dashboardRoute);


const supplierRoute = require('./routes/supplierRoute.js');
app.use(supplierRoute);

const supplierPageInfoRoute = require('./routes/supplierPageInfoRoute.js')
app.use(supplierPageInfoRoute)

const adminRoute = require('./routes/adminRoute.js');
const products = require('./models/products');
app.use(adminRoute)



const date = new Date()
//console.log(date.getMonth() + 1)

require("dotenv").config();

// app.use(bodyParser.urlencoded({
//     extended: false
// }));
// app.use(bodyParser.json());

app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

app.use(cors());


app.set('view engine', 'handlebars');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

app.post('/api/testapi1', (req, res) => {
    res.json({
        message: 'sent message 1'
    })
})

app.post('/api/testapi2', (req, res) => {
    res.json({
        message: 'sent message 2'
    })
})

//console.log('current year is', new Date().getFullYear())
// app.post('/api/createFakeData', (req, res) => {
//     // for (i = 0; i < 100; i++) {
//     //     db.users.create({
//     //         user_type: 'business',
//     //         email: faker.internet.email(),
//     //         profile_photo: faker.internet.avatar(),
//     //         national_number: 11111111111111,
//     //         full_arabic_name: faker.name.findName(),
//     //         password: faker.internet.password(),
//     //         mobile_number: faker.phone.phoneNumber(),

//     //     })
//     // }

//     for (var i = 0; i < 1000; i++) {
//         db.products.create({
//             main_picture: faker.image.avatar(),
//             extra_picture_1: faker.image.avatar(),
//             extra_picture_1: faker.image.avatar(),
//             product_name: faker.name.firstName(),
//             category_id: faker.random.number({
//                 min: 1,
//                 max: 4
//             }),
//             bussiness_id: 57,
//             pending_status: 'pending',
//             product_code: faker.random.number(),
//             unit_price: faker.random.number({
//                 min: 100,
//                 max: 44444
//             }),
//             describtion: faker.lorem.paragraph(),
//             color: faker.internet.color(),
//             user_id: faker.random.number({
//                 min: 106,
//                 max: 208,
//             }),
//             buy_counter: 0

//         })
//     }
//     res.send('records created')
// })

app.post('/api/editAllProducts', (req, res) => {
    db.products.update({
        main_picture: 'https://picsum.photos/450'
    }, {
        where: {
            product_id: {
                [Op.gte]: 19
            }
        }
    })
})



app.put('/api/generateProducts', (req, res) => {
    // for (var i = 0; i < 1000; i++) {
    //     db.products_generator.create({
    //         main_picture: faker.image.avatar(),
    //         extra_picture_1: faker.image.avatar(),
    //         extra_picture_1: faker.image.avatar(),
    //         product_name: faker.name.firstName(),
    //         category_id: faker.random.number({
    //             min: 1,
    //             max: 4
    //         }),
    //         bussiness_id: 57,
    //         pending_status: 'pending',
    //         product_code: faker.random.number(),
    //         unit_price: faker.random.number({
    //             min: 100,
    //             max: 44444
    //         }),
    //         describtion: faker.lorem.paragraph(),
    //         color: faker.internet.color(),
    //         user_id: faker.random.number({
    //             min: 106,
    //             max: 208,
    //         }),
    //         buy_counter: 0

    //     })
    // }
    // for (var i = 1; i < 50; i + 10) {

    //     db.products.findOne({
    //         where: {
    //             product_id: i
    //         }
    //     }).then(products => {
    //         if (products) {
    //             products.update({
    //                 main_picture: 'https://picsum.photos/id/2/200/300',
    //                 extra_picture1: 'https://picsum.photos/id/2/200/300',
    //                 extra_picture2: 'https://picsum.photos/id/2/200/300'
    //             })
    //         }

    //     })
    // }

    var generate = faker.image.sports()
    res.send(generate)
})



app.listen(5000, () => {
    console.log('listening on port 5000');
})