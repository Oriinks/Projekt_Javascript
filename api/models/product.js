const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Product", productSchema);