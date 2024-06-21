const Item = require("../models/item");
const Category = require("../models/category")
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async(req, res, next) =>{
    res.render("index",{
        title: "Main Page",
    })
})

//shows the list of items
exports.item_list = asyncHandler(async (req, res, next) =>{
    const items = await Item.find({}, "name category")
        .sort({ name: 1})
        .populate("category")
        .exec();
    
    res.render("item_list", { title: "Items", item_list: items })
})

// exports.item_details = asyncHandler(async (req,res, next) =>{

// })

//displays item create form
exports.item_create_get = asyncHandler(async (req, res, next) =>{
    //need to get all categories that are in the db so that the user can select a category when making an item
    const allCategories = await Category.find().sort({ name: 1 }).exec();

    //renders the item form
    res.render("item_form", {
        title: "Create new item",
        categories: allCategories
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
    body("category", "Category must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("stock", "Stock amount must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    asyncHandler(async (req, res, next) =>{
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.itemName,
            description: req.body.description,
            category: req.body.category,
            stock: req.body.stock
        })

        //checks for errors in the form
        if(!errors.isEmpty()){
            const allCategories = await Category.find().sort({ name: 1 }).exec();

            res.render("item_form", {
                title: "Create new Item",
                item: req.body,
                categories: allCategories,
                errors: errors.array()
            })
            return;
        }else{
            //else save the item
            await item.save();
            //redirects user to the items page
            res.redirect("/home/item/get");
        }
    })
]