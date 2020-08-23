const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const crypto = require('crypto');
// const faker = require('faker');
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


const date = new Date()
console.log(date.getMonth())

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

app.post('/api/createFakeData', (req, res) => {
    for (i = 0; i < 100; i++) {
        db.users.create({
            user_type: 'business',
            email: faker.internet.email(),
            profile_photo: faker.internet.avatar(),
            national_number: 11111111111111,
            full_arabic_name: faker.name.findName(),
            password: faker.internet.password(),
            mobile_number: faker.phone.phoneNumber(),

        })
    }
    res.send('records created')
})

app.listen(3000, () => {
    console.log('listening on port 3000');
})