const express = require("express");
const router = express.Router();

const item_controller = require("../controllers/itemController");
const category_controller = require("../controllers/categoryController");

//file to keep all the routes
// / is the main homepage that the user first sees 
router.get("/", item_controller.index);

router.get("/item/get", item_controller.item_list);
router.get("/item/create", item_controller.item_create_get);
router.post("/item/create", item_controller.item_create_post);
//route with an :id should be the last routes because they are less specific
router.get("/item/:id", item_controller.item_details);
router.get("/item/:id/delete", item_controller.item_delete_get);
router.post("/item/:id/delete", item_controller.item_delete_post);

router.get("/category/get", category_controller.category_list);
router.get("/category/create", category_controller.category_create_get);
router.post("/category/create", category_controller.category_create_post);
router.get("/category/:id", category_controller.category_details);


module.exports = router;