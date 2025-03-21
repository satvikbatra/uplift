const mongoose = require('mongoose');

const appraisalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now }
});

const Appraisal = mongoose.model.appraisalSchema || mongoose.model('Appraisal', appraisalSchema);

module.exports = {
    Appraisal
};