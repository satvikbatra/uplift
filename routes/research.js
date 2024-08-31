const express = require('express');
const { userMiddleware } = require('../middleware/userMiddleware');
const { Research } = require('../models/research');
const { researchPaperSchemaZod } = require('../validation/research');
const { User } = require('../models/user');

const router = express.Router();

router.post('/add', userMiddleware, async (req, res) => {
    try {
        const data = req.body;
        // console.log(data);
        const response = researchPaperSchemaZod.safeParse(data);

        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong inputs.",
                // errors: response.error.errors,
            })
        }
        // console.log("1");
        const { title, description, certificate_of_publication, verification_link, conference_name, publish_date } = req.body;

        const newResearch = new Research({
            user: req.user._id,
            title,
            description,
            certificate_of_publication,
            verification_link,
            conference_name,
            publish_date
        });
        // console.log("1");


        await newResearch.save();

        await User.findOneAndUpdate(
            req.user._id,
            { $push: { researchPapers: newResearch._id } },
            { new: true }
        );

        // console.log("1");


        return res.status(200).json({
            msg: "Research Paper added successfully.",
            researchPaperId: newResearch._id
        });

    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
});

router.get('/', userMiddleware, async (req, res) => {
    try {
        const researchPapers = await Research.find({ user: req.user._id });

        return res.status(200).json({
            researchPapers
        });
    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.get('/:id', userMiddleware, async (req, res) => {
    try {
        const researchPaper = await Research.findById(req.params.id);

        if(!researchPaper || researchPaper.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Paper not found."
            });
        }
        
        return res.status(200).json({
            researchPaper: researchPaper
        });   
    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
});

router.put('/:id', userMiddleware, async (req, res) => {
    try {
        const data = req.body;
        const response = researchPaperSchemaZod.safeParse(data);

        if(!response.success) {
            res.status(411).json({
                msg: "You sent the wrong input."
            })
        }

        const { title, description, certificate_of_publication, verification_link, conference_name, publish_date } = req.body;
        const researchPaper = await Research.findById(req.params.id);

        if(!researchPaper || researchPaper.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Paper not found."
            });
        }

        researchPaper.title = title || researchPaper.title;
        researchPaper.description = description || researchPaper.description;
        researchPaper.certificate_of_publication = certificate_of_publication || researchPaper.certificate_of_publication;
        researchPaper.verification_link = verification_link || researchPaper.verification_link;
        researchPaper.conference_name = conference_name || researchPaper.conference_name;
        researchPaper.publish_date = publish_date || researchPaper.publish_date;

        await researchPaper.save();

        return res.status(200).json({
            msg: "Research paper updated successfully."
        })

    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

router.delete('/:id', userMiddleware, async (req, res) => {
    try {
        const researchPaper = await Research.findById(req.params.id);

        if(!researchPaper || researchPaper.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Paper not found."
            });
        }

        await researchPaper.deleteOne();

        await User.findByIdAndUpdate(
            req.params.id, 
            { $pull: {researchPapers: researchPaper._id } }
        );

        return res.status(200).json({
            msg: "Research Paper deleted successfully."
        })

    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

module.exports = router;