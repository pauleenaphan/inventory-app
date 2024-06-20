const Item = require("../models/item");
const Category = require("../models/catgeory")
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async(req, res, next) =>{
    res.render("index",{
        title: "Main Page",
    })
})

//displays item create form
exports.item_create_get = asyncHandler(async (req, res, next) =>{
    const allCategories = await Category.find().sort({ name: 1 }).exec();

    res.render("item_form", {
        title: "Create new item",
        // category: allCategories
    })
})

//handles create item on post
exports.item_create_post = [
    //checks for user input 
    body("itemName", "Name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    // body("category", "Category must not be empty.")
    //     .trim()
    //     .isLength({ min: 1 })
    //     .escape(),
    body("stock", "Stock amount must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    asyncHandler(async (req, res, next) =>{
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.itemName,
            description: req.body.description,
            // category: "new c",
            stock: req.body.stock
        })

        //checks for errors in the form
        if(!errors.isEmpty()){
            const allCategories = await Category.find().sort({ name: 1 }).exec();

            res.render("item_form", {
                title: "Create new Item",
                item: req.body,
                // category: "cateog",
                errors: errors.array()
            })
            return;
        }else{
            //else save the item
            await item.save();
            // res.redirect(item.url);
            res.redirect("/home");
        }
    })
]