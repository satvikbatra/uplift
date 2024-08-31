const express = require('express');
const { userMiddleware } = require('../middleware/userMiddleware');
const { otherAchievementsSchemaZod } = require('../validation/otherAchievements');
const { OtherAchievements } = require('../models/otherAchievements');
const { User } = require('../models/user');

const router = express.Router();

router.post('/add', userMiddleware, async(req, res) => {
    try {
        const data = req.body;
        const response = otherAchievementsSchemaZod.safeParse(data);

        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong inputs."
            });
        }

        const { title, description, date, category } = req.body;

        const newAchievement = new OtherAchievements({
            user: req.user._id,
            title, 
            description,
            date,
            category
        });

        await newAchievement.save();

        await User.findByIdAndUpdate(
            req.user._id, 
            { $push: { otherAchievements: newAchievement._id } }, 
            { new: true } 
        );
        
        return res.status(200).json({
            msg: "New achievement added successfully.",
            newAchievementId: newAchievement._id
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.get('/', userMiddleware, async (req, res) => {
    try {
        const achievements = await OtherAchievements.find({ user: req.user._id });

        return res.status(200).json({
            achievements
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.get('/:id', userMiddleware, async (req, res) => {
    try {
        const achievement = await OtherAchievements.findById(req.params.id);

        if(!achievement || achievement.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Achievement not found."
            });
        }

        return res.status(200).json({
            achievement: achievement
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.put('/:id', userMiddleware, async (req, res) => {
    try {
        const data = req.body;
        const response = otherAchievementsSchemaZod.safeParse(data);

        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong inputs."
            });
        }

        const { title, description, date, category } = req.body;
        const achievement = await OtherAchievements.findById(req.params.id);

        if(!achievement || achievement.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Achievement not found."
            });
        }

        achievement.title = title || achievement.title;
        achievement.description = description || achievement.description;
        achievement.date = date || achievement.date;
        achievement.category = category || achievement.category;

        await achievement.save();

        return res.status(200).json({
            msg: "Achievement updated successfully."
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.delete('/:id', userMiddleware, async (req, res) => {
    try {
        const achievement = await OtherAchievements.findById(req.params.id);

        if(!achievement || achievement.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Achievement not found."
            });
        }

        await achievement.deleteOne();

        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { otherAchievements: achievement._id } }
        );

        return res.status(200).json({
            msg: "Achievement deleted successfully."
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;
