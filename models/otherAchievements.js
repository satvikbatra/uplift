const mongoose = require('mongoose');

const otherAchievementsSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: false }
})

const OtherAchievements = mongoose.model('OtherAchievements', otherAchievementsSchema);

module.exports = {
    OtherAchievements
};