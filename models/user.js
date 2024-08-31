const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    is_admin: { type: Boolean, default: false },
    personal_email_id: { type: String, required: true, unique: true },
    organization_email_id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },


    profile_image: { type: String },
    phone_number: { type: Number },
    gender: { type: String },
    department_name: { type: String },
    role: { type: String },
    researchPapers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Research' }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    seminars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seminar' }],
    certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }],
    otherAchievements: [{ type: mongoose.Schema.Types.ObjectID, ref: 'OtherAchievements' }],
    latestAcadmicFeedback: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
})


const User = mongoose.model('User', userSchema);

module.exports = {
    User
}