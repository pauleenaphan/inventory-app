const Item = require("../models/item");
const Category = require("../models/category")
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async(req, res, next) =>{
    const [numItems, numCategories] = await Promise.all([
        Item.countDocuments({}).exec(),
        Category.countDocuments({}).exec()
    ]);

    res.render("index", {
        title: "Inventory Mangement Homepage",
        item_count: numItems,
        category_count: numCategories
    });
})

exports.item_details = asyncHandler(async (req, res, next) => {
    // Fetch the item and populate its category field
    const item = await Item.findById(req.params.id).populate("category").exec();
    console.log("item_details route");
    if (!item) {
        // If the item is not found, create an error and pass it to the next middleware
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
    }

    console.log("Item:", item);

    // Render the item details view
    res.render("item_detail", {
        title: item.name,
        item: item
    });
});

//shows the list of items
exports.item_list = asyncHandler(async (req, res, next) =>{
    const items = await Item.find({}, "name category")
        .sort({ name: 1})
        .populate("category")
        .exec();
    
    res.render("item_list", { title: "Items", item_list: items })
})


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

exports.item_delete_get = asyncHandler(async(req, res, next) =>{
    const item = await Item.findById(req.params.id).populate("category").exec();

    if(item == null){
        res.redirect("home/item/get")
    }

    res.render("item_delete", {
        title: item.name,
        item: item
    })
})

exports.item_delete_post = asyncHandler(async(req, res, next) =>{
    //also removes item from the category show it won't show up in the category section
    await Item.findByIdAndDelete(req.body.itemid);
    res.redirect("/home/item/get");
})

exports.item_update_get = asyncHandler(async(req, res, next) =>{
    const [item, allCategories] = await Promise.all([
        Item.findById(req.params.id).populate("category").exec(),
        Category.find().sort({ family_name: 1 }).exec()
    ])  

    res.render("item_form", {
        title: "Update Item",
        item: item,
        categories: allCategories,
    })
})

exports.item_update_post = asyncHandler(async(req, res, next) =>{
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
        .escape()
    
    const errors = validationResult(req);
    const item = new Item({
        _id: req.params.id, // This is required, or a new ID will be assigned!
        name: req.body.itemName,
        description: req.body.description,
        category: req.body.category,
        stock: req.body.stock
    });

    if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values and error messages.
        res.render('item_form', {
            title: 'Update Item',
            item: item,
            errors: errors.array()
        });
        return;
    } else {
        // Data from form is valid. Update the record.
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
        // Redirect to author detail page.
        res.redirect(updatedItem.url);
    }
})