const express = require("express");
const router = express.Router();
const db = require("../database");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const path = require("path");

router.use(cors());

router.post("/api/testcategory", (req, res) => {
  db.product_categories
    .findOne({
      where: {
        category_id: 40,
      },
    })
    .then((category) => res.send(category));
});

router.post("/api/fillClosureTable", async (req, res) => {
  debugger;
  var products = await db.products.findAll({
    where: {
      category_id: {
        [Op.ne]: null,
      },
    },
  });

  var categoryId = products[0].category_id;
  var parentId = 56;
  debugger;
  products.forEach(async (element) => {
    categoryId = element.category_id;
    debugger;
    while (parentId != null) {
      debugger;
      var category = await db.product_categories.findOne({
        where: {
          category_id: categoryId,
        },
      });
      parentId = category.parent_id;

      db.categories_closure
        .create({
          product_id: element.product_id,
          category_id: categoryId,
        })
        .then((table) => {
          debugger;
          categoryId = parentId;
        });
    }
  });

  res.send("created");
});

router.post("/api/filterProductsByCategory", async (req, res) => {
  var catname = req.body.category_name;
  var siteLanguage = req.body.siteLanguage;
  var cat;
  var products = [];

  if (catname && siteLanguage == "en") {
    cat = await db.product_categories.findOne({
      where: {
        category_name: catname,
      },
    });
  } else if (catname && siteLanguage == "ar") {
    cat = await db.product_categories.findOne({
      where: {
        category_arabic_name: catname,
      },
    });
  }
  if (cat) {
    var closureProducts = await db.categories_closure.findAll({
      where: {
        category_id: cat.category_id,
      },
    });

    var promise = new Promise((resolve, reject) => {
      closureProducts.forEach(async (element, index, array) => {
        var product = await db.products.findOne({
          where: {
            product_id: element.product_id,
          },
        });
        products.push(product.category_id);
        if (index === array.length - 1) resolve();
      });
    });

    promise.then(() => {
      res.json({
        products,
      });
    });
  }
});

module.exports = router;
