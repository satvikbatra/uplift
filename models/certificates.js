const mongoose = require('mongoose');

const certificateSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    platform: { type: String, required: true },
    field: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String, required: true },
    verification_link: { type: String, required: true },
    date: { type: Date, required: true },
    rating: { type: Number, default: 0 }
})

const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);

module.exports = {
    Certificate
};