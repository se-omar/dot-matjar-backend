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
  db.products.update(
    {
      category_id: 64,
    },
    {
      where: {
        category_id: null,
      },
    }
  );
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
    while (parentId != null) {
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

router.post("/api/adminPageAddCategory", async (req, res) => {
  db.product_categories
    .create({
      parent_id: req.body.parentCatId == 64 ? null : req.body.parentCatId,
      category_name: req.body.category_name,
      category_arabic_name: req.body.category_arabic_name,
    })
    .then((row) => {
      res.send(row);
    });
});

router.post("/api/supplierPageAddCategories", async (req, res) => {
  var supplierCategories = req.body.supplierCategories;
  var cat;
  var parentId;
  var parentCat;
  var catId;
  var catCheck;
  var closure;
  if (supplierCategories) {
    for (var i = 0; i < supplierCategories.length; i++) {
      catCheck = null;
      var cat = await db.product_categories.findByPk(supplierCategories[i]);
      parentId = cat.parent_id;
      catId = cat.category_id;

      catCheck = await db.suppliers_categories_closure.findOne({
        where: {
          category_id: cat.category_id,
        },
      });

      do {
        if (!catCheck) {
          closure = await db.suppliers_categories_closure.create({
            supplier_id: req.body.supplier_id,
            category_id: catId,
            parent_id: parentId,
            category_name: cat.category_name,
            category_arabic_name: cat.category_arabic_name,
          });
          catId = parentId;

          parentCat = await db.product_categories.findOne({
            where: {
              category_id: catId,
            },
          });
          parentId = parentCat ? parentCat.parent_id : null;
        }
      } while (parentId != null);

      catCheck = await db.suppliers_categories_closure.findOne({
        where: {
          category_id: parentCat.category_id,
        },
      });
      if (parentCat && parentCat.parent_id == null && !catCheck) {
        closure = await db.suppliers_categories_closure.create({
          supplier_id: req.body.supplier_id,
          category_id: parentCat.category_id,
          parent_id: parentCat.parent_id,
          category_name: parentCat.category_name,
          category_arabic_name: parentCat.category_arabic_name,
        });
      }
    }
    res.send("product added successfully");
  } else res.send("error happened");
});

var supplierTreeAr = [];
router.post("/api/getSupplierCategoriesTree", async (req, res) => {
  supplierTreeAr = [];
  await processSupplierCategoriesTree(
    null,
    null,
    req.body.supplier_id,
    req.body.language
  );
  res.json({ categoriesTreeArray: supplierTreeAr });
});

async function processSupplierCategoriesTree(parentId, parentRow, supplierId, language) {
  var rows = await db.suppliers_categories_closure.findAll({
    where: {
      supplier_id: supplierId,
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
      supplierTreeAr.push(p);
    } else {
      if (!parentRow.children) parentRow.children = [];
      parentRow.children.push(p);
    }
    await processCategoriesTree(p.id, p, language);
  }
}

module.exports = router;
