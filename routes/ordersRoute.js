const express = require('express');
const router = express.Router();
const db = require('../database');
//const stripe = require('stripe')('sk_test_51H97oICdSDXTIUwz1HsESGMmCODSWE7Ct0hUQ1sRzeSU1rEi0qS5x6n0SYdUmoiXjQeMQAB58xDuvsWp0XjuT2sk00DAVbX0l9')
const bodyParser = require('body-parser');
const cors = require('cors')
const crypto = require('crypto');
const orderid = require('order-id')('mysecret')
var date = new Date()

const nodemailer = require('nodemailer');
router.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

router.use(cors());


router.put('/api/getUserOrders', (req, res) => {
    db.orders.findAll({
        where: {
            user_id: req.body.user_id
        },
        include: [{ model: db.products_orders }]
    }).then(orders => {
        res.json({
            data: orders
        })
    }).catch(err => {
        console.log(err)
    })
})



router.put('/api/getOrderProducts', (req, res) => {
    db.products_orders.findAll({
        where: {
            order_id: req.body.order_id
        },
        include: [{
            model: db.products
        }]
    }).then(orders => {
        res.send(orders)
    })

})

router.put('/api/showOrderProducts', async (req, res) => {
    var order = await db.orders.findOne({
        where: {
            order_number: req.body.order_number
        }
    })
    db.products_orders.findAll({
        where: {
            order_id: order.order_id
        },
        include: [
            { model: db.products }
        ]
    }).then(products => {
        res.json({
            data: products
        })
    })
})

router.post('/api/createOrder', async (req, res) => {
    var quantities = req.body.productsQuantities
    var cart = await db.cart.findOne({
        where: {
            user_id: req.body.user_id
        }
    })
if(!cart){
    var cart = await db.cart.create({
        user_id : req.body.user_id,
        cart_activity : 1
    })
}
    var cartProducts = await db.cart_products.findAll({
        where: {
            cart_id: cart.cart_id
        },
    })

    for (var k = 0; k < cartProducts.length; k++) {
        await db.cart_products.update({
            quantity: quantities[k]
        }, {
            where: {
                cart_products_id: cartProducts[k].cart_products_id
            }
        })
    }

    var order = await db.orders.create({
        user_id: req.body.user_id,
        status: 'pending',
        order_date: new Date(),
        order_number: orderid.generate(),
        order_month: date.getMonth() + 1,
        order_year: date.getFullYear(),
        country: req.body.governorate,
        city: req.body.region,
        address_line_1: req.body.address,
        total_price : req.body.total_price
    })

    for (var i = 0; i < cartProducts.length; i++) {
        await db.products_orders.create({
            order_id: order.order_id,
            user_id: order.user_id,
            product_id: cartProducts[i].product_id,
            purchase_date: new Date(),
            quantity: quantities[i],
            product_color: cartProducts[i].product_color
        })

        var product = await db.products.findByPk(cartProducts[i].product_id);

        product.update({
            buy_counter: product.buy_counter + quantities[i],
            stock_remaining: product.stock_remaining - quantities[i]
        })

        var user = await db.users.findByPk(product.user_id)

        await user.update({
            total_revenue: user.total_revenue + (product.unit_price * quantities[i]),
            total_sales: user.total_sales + quantities[i]
        })
    }
var userMadeOrder = await db.users.findOne({
    where:{
        user_id : order.user_id
    }
})
var suppliersHaveProducts = []
for (let r=0 ; r<cartProducts.length ; r++){
    var check=true
    var productInCart =await db.products.findByPk(cartProducts[r].product_id);
var supplier = await db.users.findOne({
    where:{
        user_id:productInCart.user_id
    }
})
if(suppliersHaveProducts.length>0){
    for(let t=0 ; t<suppliersHaveProducts.length;t++){
        if(suppliersHaveProducts[t].user_id == supplier.user_id){
            check = false
        }
    }
}
if(check==true){
suppliersHaveProducts.push(supplier)
}
}
var suppiler=[]

for(let p = 0 ; p<suppliersHaveProducts.length;p++){
    var supplierProducts=[]
for(let c=0 ; c<cartProducts.length ; c++){
    var productInCart =await db.products.findByPk(cartProducts[c].product_id);
if(suppliersHaveProducts[p].user_id==productInCart.user_id){
    supplierProducts.push(productInCart)
}
}
var productQuantity=[]
for(var y=0 ; y<supplierProducts.length;y++){
    var orderProductsTable = await db.products_orders.findOne({
        where:{
            order_id:order.order_id,
            product_id : supplierProducts[y].product_id
        }
    })
    productQuantity.push(orderProductsTable.quantity)
}


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
    from: 'DOT-MATJAR', // sender address
    to: suppliersHaveProducts[p].email, // list of receivers
    subject: "An order is placed with One of your Products", // Subject line
    text: "An order is placed with One of your Products,Please view your ordered products to submit", // plain text body
    html: `<table>
    <tr>
   
    <th>Product Name</th>
    <th>Product Code</th>
    <th>Quantity</th>
    </tr>
    <tr>
    <td>${supplierProducts[0]?supplierProducts[0].product_name:''}</td>
    <td>${supplierProducts[0]?supplierProducts[0].product_code:''}</td>
    <td>${productQuantity[0]?productQuantity[0]:''}</td>
    </tr>
    <tr>
    <td>${supplierProducts[1]?supplierProducts[1].product_name:''}</td>
    <td>${supplierProducts[1]?supplierProducts[1].product_code:''}</td>
    <td>${productQuantity[1]?productQuantity[1]:''}</td>

    </tr>
    <tr>
    <td>${supplierProducts[2]?supplierProducts[2].product_name:''}</td>
    <td>${supplierProducts[2]?supplierProducts[2].product_code:''}</td>
    <td>${productQuantity[2]?productQuantity[2]:''}</td>

    </tr>
    <tr>
    <td>${supplierProducts[3]?supplierProducts[3].product_name:''}</td>
    <td>${supplierProducts[3]?supplierProducts[3].product_code:''}</td>
    <td>${productQuantity[3]?productQuantity[3]:''}</td>

    </tr>
    <tr>
    <td>${supplierProducts[4]?supplierProducts[4].product_name:''}</td>
    <td>${supplierProducts[4]?supplierProducts[4].product_code:''}</td>
    <td>${productQuantity[4]?productQuantity[4]:''}</td>

    </tr>
    <tr>
    <td>${supplierProducts[5]?supplierProducts[5].product_name:''}</td>
    <td>${supplierProducts[5]?supplierProducts[5].product_code:''}</td>
    <td>${productQuantity[5]?productQuantity[5]:''}</td>

    </tr>
    <tr>
    <td>${supplierProducts[6]?supplierProducts[6].product_name : ''}</td>
    <td>${supplierProducts[6]?supplierProducts[6].product_code:''}</td>
    <td>${productQuantity[6]?productQuantity[6]:''}</td>

    </tr>
    </table>
    <br/>
    <p>Order Number : ${order.order_number}</p>
    <p>Order Date : ${order.order_date}</p>
    <p>Order Country : ${order.country}</p>
    <p>Order city : ${order.city}</p>
    <p>Order Address : ${order.address_line_1}</p>
    <p>User Name : ${userMadeOrder.full_arabic_name}</p>
    <p>User Mobile Number : ${userMadeOrder.mobile_number}</p>


    `

}
transporter.sendMail(mailoptions, function (err) {
    if (err) {

        console.log('err', err)
        res.json({ message: 'Failed' })
    } else {
        console.log("email sent!!!!")

       

    }
})


}


// for(let x=0 ; x<cartProducts.length ; x++){

// var productInCart =await db.products.findByPk(cartProducts[x].product_id);
// var supplier = await db.users.findOne({
//     where:{
//         user_id:productInCart.user_id
//     }
// })
// let transporter = nodemailer.createTransport({
//     service: "gmail",

//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: 'dotmarketofficial@gmail.com', // generated ethereal user
//         pass: 'dotmarket123', // generated ethereal password
//     },
//     tls: {
//         regectUnauthorized: false
//     }
// });





// let mailoptions = {
//     from: 'DOT-MATJAR', // sender address
//     to: supplier.email, // list of receivers
//     subject: "An order is placed with One of your Products", // Subject line
//     text: "An order is placed with One of your Products,Please view your ordered products to submit", // plain text body
//     html: `<p>Order Number : ${order.order_number}</p>
//     <p>Order Date : ${order.order_date}</p>
//     <p>Product Name:${productInCart.product_name}</p>
//     <p>Product Code:${productInCart.product_code}</p>

//     `

// }
// transporter.sendMail(mailoptions, function (err) {
//     if (err) {

//         console.log('err', err)
//         res.json({ message: 'Failed' })
//     } else {
//         console.log("email sent!!!!")

       

//     }
// })

// }
    res.json({ message: 'order created successfully' })
})




router.put('/api/getCategoryItems', async (req, res) => {
    var category = await db.product_categories.findOne({
        where: { category_name: req.body.category_name }
    })
    db.category_items.findAll({
        where: {
            category_id: category.category_id
        }
    }).then(items => {
        res.json({ message: 'items FOUND', data: items })
    })

})


router.put('/api/getOrder' , async(req,res)=>{
    var order;
    var productsInOrder;


    console.log('idddddddddddd',req.body.user_id)
    if (!req.body.order_id){
        
var orders =await  db.orders.findAll({
    where:{
        user_id : req.body.user_id
    }
   
})
   
    order = await db.orders.findOne({
        where:{
            order_id : orders[orders.length-1].order_id
        },
        include:[{model:db.users}]
        
    })
    productsInOrder = await db.products_orders.findAll({
        where:{
            order_id : order.order_id
        },
        include:[{model:db.products}]
    })
 

    }
    else if(req.body.order_id){
order = await db.orders.findOne({
    where:{
        order_id : req.body.order_id
    },
    include:[{model:db.users}]
})
productsInOrder = await db.products_orders.findAll({
    where:{
        order_id : order.order_id
    },
    include:[{model:db.products}]
})

    }
res.json({order :order, productsInOrder : productsInOrder , message:'Order Found'})
})



module.exports = router;