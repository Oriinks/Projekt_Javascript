const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true},
    customer: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true},
    date: {type: Date, default: Date.now(),
    prize: {tye:Number,  required: true}}
});

module.exports = mongoose.model('Order', orderSchema);