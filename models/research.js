const mongoose = require('mongoose');

const researchPaperSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    certificate_of_publication: { type: String, required: true },
    verification_link: { type: String, required: true },
    conference_name: { type: String, required: true },
    publish_date: { type: Date, default: Date.now }
})

const Research = mongoose.model('Research', researchPaperSchema);

module.exports = {
    Research
}