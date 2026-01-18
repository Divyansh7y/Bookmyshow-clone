const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    screens: [{
        screenNumber: {
            type: Number,
            required: true
        },
        capacity: {
            type: Number,
            required: true
        },
        seats: [{
            row: {
                type: String,
                required: true
            },
            number: {
                type: Number,
                required: true
            },
            type: {
                type: String,
                enum: ['normal', 'premium', 'vip'],
                default: 'normal'
            },
            price: {
                type: Number,
                required: true
            }
        }]
    }],
    amenities: [{
        type: String
    }],
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Theater', theaterSchema); 