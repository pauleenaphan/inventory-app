const Item = require("../models/item");
const Category = require("../models/category")
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.category_details = asyncHandler(async (req, res, next) =>{
    const [category, AllItems] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({category: req.params.id}, "name")
    ])

    res.render("category_detail", {
        title: category.name,
        category: category,
        items: AllItems
    })
})

exports.category_list = asyncHandler(async (req, res, next) =>{
    const categories = await Category.find({}, "name description")
    .sort({ name: 1 })
    .exec();

    res.render("category_list", { title: "Categories", category_list: categories})
})

exports.category_create_get = asyncHandler(async (req, res, next) =>{
    res.render("category_form", {
        title: "Create new category",
    })
})

exports.category_create_post = [
    body("categoryName", "Name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    asyncHandler(async (req, res, next) =>{
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.categoryName,
            description: req.body.description
        })

        if(!errors.isEmpty()){
            res.render("category_form", {
                title: "Create new category",
                category: req.body,
                errors: errors.array()
            })
            return;
        }else{
            await category.save();
            res.redirect("/home/category/get");
        }
    })
]