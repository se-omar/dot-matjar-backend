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

var treeAr = [];
router.post("/api/getCategoriesTree", async (req, res) => {
  treeAr = [];
  await processCategoriesTree(null, null, req.body.language);
  res.json({ categoriesTreeArray: treeAr });
});

async function processCategoriesTree(parentId, parentRow, language) {
  var rows = await db.product_categories.findAll({
    where: {
      parent_id: parentId,
    },
  });
  var i = 0;
  var p;
  for (i = 0; i < rows.length; i++) {
    p = {
      id: rows[i].category_id,
      name: language == "en" ? rows[i].category_name : rows[i].category_arabic_name,
    };
    if (!parentRow) {
      treeAr.push(p);
    } else {
      if (!parentRow.children) parentRow.children = [];
      parentRow.children.push(p);
    }
    await processCategoriesTree(p.id, p, language);
  }
}

module.exports = router;
