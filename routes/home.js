const express = require("express");
const router = express.Router();

const item_controller = require("../controllers/itemController");

router.get("/", item_controller.index);

router.get("/item/create", item_controller.item_create_get);
router.post("/item/create", item_controller.item_create_post);

module.exports = router;