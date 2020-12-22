const express=require('express');
const router= express.Router();
const{activate}=require('../webservices')


router.post('/activate',activate);
 module.exports=router;