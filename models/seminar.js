const mongoose = require('mongoose');

const seminarSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    role: { type: String, required: true },
    date: { type: Date, required: true },
    rating: { type: Number, default: 0 }
})

const Seminar = mongoose.model('Seminar', seminarSchema);

module.exports = {
    Seminar
};