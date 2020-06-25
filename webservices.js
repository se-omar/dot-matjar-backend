const express = require('express');
const db = require('./database');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());



//==============================================
//USERS TABLE
app.get('/api/users', async (req, res) => {
    await db.users.findAll().then((data) => {
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
    db.business.findAll().then((data) => {
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
    db.products.findAll().then((data) => {
        res.send(data);
    })
})

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

app.post('/api/products', (req, res) => {
    db.products.create({
        product_name: req.body.product_name,
        product_code: req.body.product_code,
        HS_code: req.body.HS_code,
        min_units_per_order: req.body.min_units_per_order,
        unit_price: req.body.unit_price,
        size: req.body.size,
        color: req.body.color,
        unit_weight: req.body.unit_weight,
        has_discount: req.body.has_discount,
        discount_amount: req.body.discount_amount,
        availability: req.body.availability,
        product_rating: req.body.product_rating
    })
    res.send('row created successfully')
})

app.listen(3000, () => {
    console.log('listening on port 3000');
})