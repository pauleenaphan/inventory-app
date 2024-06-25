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

exports.category_delete_get = asyncHandler(async(req, res, next) =>{
    const category = await Category.findById(req.params.id).exec();

    if(category == null){
        res.redirect("home/category/get");
    }

    res.render("category_delete",{
        title: category.name,
        category: category
    })
})

exports.category_delete_post = asyncHandler(async(req, res, next) =>{
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect("/home/category/get");
})

exports.category_update_get = asyncHandler(async(req, res, next) =>{
    const category = await Category.findById(req.params.id).exec();

    res.render("category_form",{
        title: "Update Category",
        category: category,
    })


})

exports.category_update_post = asyncHandler(async(req, res, next) =>{
    body("categoryName", "Name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape()
        
    const errors = validationResult(req);
    const category = new Category({
        _id: req.params.id, // This is required, or a new ID will be assigned!
        name: req.body.categoryName,
        description: req.body.description,
    });

    if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values and error messages.
        res.render('category_form', {
            title: 'Update Category',
            category: category,
            errors: errors.array()
        });
        return;
    } else {
        // Data from form is valid. Update the record.
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
        // Redirect to author detail page.
        res.redirect(updatedCategory.url);
    }
})