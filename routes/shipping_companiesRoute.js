const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs')
const Sequelize = require('sequelize');
const { shipping_rate } = require('../database');
const Op = Sequelize.Op;


router.get('/api/getAllShippingCompanies',async(req,res)=>{
    db.shipping_companies.findAll({
        include:[{model : db.collection_rate},{model:db.shipping_rate}]
    }).then(
    companies =>{
        res.json({data:companies})
    }
    )
})

router.put('/api/updateDefaultShippingCompany',async (req,res)=>{
db.shipping_companies.findOne({
    where:{
        shipping_companies_id : req.body.shipping_companies_id
    }
}).then (company=>{
    company.update({
        default : 'TRUE'

    })
})
})


router.post('/api/addNewShippingCompany',async (req,res)=>{
    db.shipping_companies.create({
        company_name : req.body.company_name ,
        company_number : req.body.company_number,
        company_address1 : req.body.company_address1,
        company_address2 : req.body.company_address2,
        company_address3 : req.body.company_address3
    }).then (async company =>{
        await db.shipping_rate.create({
            country : req.body.country,
            shipping_rate : req.body.shipping_rate , 
            governorate : req.body.governorate,
            shipping_companies_id : company.shipping_companies_id
        })
        await db.collection_rate.create({
                amount  : req.body.amount ,
               collection_rate : req.body.collection_rate,
                shipping_companies_id : company.shipping_companies_id
        })
    })
})



router.delete('/api/deleteShippingCompany',async (req,res)=>{
    console.log(req.body.shipping_companies_id)
db.shipping_companies.findOne({
    where:{ 
        shipping_companies_id : req.body.shipping_companies_id
    }
}).then(company=>{
company.destroy();
    res.json({message : 'company data deleted successfully'})
})
})

router.put('/api/updateShippingCompany',(req,res)=>{
    db.shipping_companies.findOne({
        where:{
            shipping_companies_id: req.body.shipping_companies_id
        }
    }).then(async company=>{
        await company.update({
            company_name : req.body.company_name ,
            company_number : req.body.company_number ,
             company_address1 : req.body.company_address1,
             company_address2 : req.body.company_address2 , 
             company_address3 : req.body.company_address3 
             
        })
        await db.shipping_rate.findone({
            where:{
                shipping_companies_id : company.shipping_companies_id
            }
        }).then(companyShippingRate =>{
companyShippingRate .update({
    country : req.body.country,
    rate : req.body.shipping_rate , 
    governorate : req.body.governorate,
    shipping_companies_id : company.shipping_companies_id
})
        })
        db.collection_rate.findOne({
            where:{
                shipping_companies_id : company.shipping_companies_id
            }
        }).then(collectionRate=>{
            collectionRate.update({
                amount  : req.body.amount ,
               collection_rate : req.body.collection_rate,
                shipping_companies_id : company.shipping_companies_id
            })
        })
    })
})

router.put('/api/getDefaultCompany',(req,res)=>{
    db.shipping_companies.findOne({
        where:{
            default:'true'
        },
        include:[{model : db.collection_rate},{model:db.shipping_rate}]
    }).then(company=>{
res.json({data: company , Message:'default company found'})
    })
})

module.exports = router;