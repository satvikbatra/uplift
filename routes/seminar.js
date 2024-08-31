const express = require('express');
const { userMiddleware } = require('../middleware/userMiddleware');
const { seminarSchemaZod } = require('../validation/seminar');
const { Seminar } = require('../models/seminar');
const { User } = require('../models/user');

const router = express.Router();

router.post('/add', userMiddleware, async(req, res) => {
    try {
        const data = req.body;
        const response = seminarSchemaZod.safeParse(data);

        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong inputs."
            });
        }

        const { title, description, location, role, date } = req.body;

        const newSeminar = new Seminar({
            user: req.user._id,
            title, 
            description,
            location,
            role,
            date
        });

        await newSeminar.save();

        await User.findByIdAndUpdate(
            req.user._id, 
            { $push: { seminars: newSeminar._id } }, 
            { new: true } 
        );
        
        return res.status(200).json({
            msg: "New seminar added successfully.",
            newSeminarId: newSeminar._id
        })

    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

router.get('/', userMiddleware, async (req, res) => {
    try {
        const seminars = await Seminar.find({ user: req.user._id });

        return res.status(200).json({
            seminars
        })

    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

router.get('/:id', userMiddleware, async (req, res) => {
    try {
        const seminar = await Seminar.findById(req.params.id);

        if(!seminar || seminar.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Paper not found."
            });
        }

        return res.status(200).json({
            seminar: seminar
        })

    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

router.put('/:id', userMiddleware, async (req, res) => {
    try {
        const data = req.body;
        const response = seminarSchemaZod.safeParse(data);

        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong inputs."
            });
        }

        const { title, description, location, role, date } = req.body;
        const seminar = await Seminar.findById(req.params.id);
        // console.log(seminar);
        if(!seminar || seminar.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Paper not found."
            });
        }

        seminar.title = title || seminar.title;
        seminar.description = description || seminar.description;
        seminar.location = location || seminar.location;
        seminar.role = role || seminar.role;
        seminar.date = date || seminar.date;

        await seminar.save();

        return res.status(200).json({
            msg: "Seminar updated successfully."
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

router.delete('/:id', userMiddleware, async (req, res) => {
    try {
        const seminar = await Seminar.findById(req.params.id);

        if(!seminar || seminar.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Paper not found."
            });
        }

        await seminar.deleteOne();

        await User.findByIdAndUpdate(
            req.params.id,
            { $pull: { seminars: seminar._id } }
        );

        return res.status(200).json({
            msg: "Seminar deleted successfully."
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

module.exports = router;