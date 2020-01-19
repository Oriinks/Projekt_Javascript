const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const historySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
    customer: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true},
    date: {type: Date,  required: true},
    Price: {type: Number,  required: true}
});

module.exports = mongoose.model('History', historySchema);