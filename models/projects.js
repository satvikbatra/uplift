const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    description: { type: String, required: true },
    github_link: { type: String, required: true },
    tech_stack: { type: [String], required: true },
    date: { type: Date, required: true }
})

const Project = mongoose.model('Project', projectSchema);

module.exports = {
    Project
};
