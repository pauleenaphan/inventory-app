const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: { type: String, require: true },
    description: { type: String, require: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: String, required: true}
})

ItemSchema.virtual("url").get(function (){
    return `/home/item/${this._id}`;
})

module.exports = mongoose.model("Item", ItemSchema);