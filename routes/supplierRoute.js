const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs')

const {
    cart
} = require('../database');

router.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

router.use(cors());

router.use(bodyParser.json({limit: '100mb', extended: true}))
router.use(bodyParser.urlencoded({limit: '100mb', extended: true}))

router.put('/api/supplierProducts/', (req, res) => {
   
    console.log('user id issss', req.body.user_id)
    db.products.findAll({
        where: {
            user_id: req.body.user_id
        },
        include: [{
            model: db.business
        }]
    })
        .then(products => {
            console.log('supplier productsss', products)
            res.json({
                data: products

            })
        })
        .catch(err => {
            console.log(err)
        })
})

router.put('/api/supplierPageColor', (req, res) => {
    db.users.findOne({
        where: {
            user_id: req.body.user_id
        }
    }).then(user => {
        if (user.user_type == 'business') {
            if (req.body.page_color) {
                user.update({
                    page_color: req.body.page_color
                })
            }
            res.json({
                message: 'page color updated',
                data: user.page_color
            })

        } else {
            res.json({
                message: 'user is not a suppliers'
            })
        }
    })
})

router.put('/api/getSupplier',(req,res)=>{
  db.users.findOne({
      where:{
          user_id:req.body.user_id
      }
  }).then(user=>{
      if(!user){res.json({message:"supplier not found"})}
      else{
      res.json({data:user})
    }   
    })
})

router.put('/api/getRegions',(req,res)=>{
  console.log('asdasdasdas',req.body.governorate)  
  var region
fs.readFile('./countries.json', 'utf8',(err,data)=>{
    if(err){
        res.send('error')
    }
    else{
var obj = JSON.parse(data);


for(var i=0 ; i<obj.length;i++){
if(obj[i].government == req.body.governorate){
    region = obj[i].cities
}
}   
res.json({data:region})
    }
})

})


router.put('/api/getGovernorate',(req,res)=>{
    var governorate=[]
    fs.readFile('./countries.json', 'utf8',(err,data)=>{
        if(err){
            res.send('error')
        }
        else{
    var obj = JSON.parse(data);
    
    
    for(var i=0 ; i<obj.length;i++){
   
        governorate .push (obj[i].government)
   
    }   
    res.json({data:governorate})
        }
    })
    
    })

router.get('/api/supplierProductsInOrder',(req,res)=>{

})




module.exports = router;