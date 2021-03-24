const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    city: {
        type: String,
        require: true
    },
    cuisine: String,
    name: {
        type: String,
        require: true
    },
    active: {
        type: Boolean,
        default: true
    }
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema, 'Restaurants');
module.exports = Restaurant;