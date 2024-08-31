const express = require('express');
const { userMiddleware } = require('../middleware/userMiddleware');
const { projectSchemaZod } = require('../validation/projects');
const { Project } = require('../models/projects');
const { User } = require('../models/user');

const router = express.Router();

router.post('/add', userMiddleware, async(req, res) => {
    try {
        const data = req.body;
        const response = projectSchemaZod.safeParse(data);

        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong inputs."
            });
        }

        const { topic, description, github_link, tech_stack, date } = req.body;

        const newProject = new Project({
            user: req.user._id,
            topic, 
            description,
            github_link,
            tech_stack,
            date
        });

        await newProject.save();

        await User.findByIdAndUpdate(
            req.user._id, 
            { $push: { projects: newProject._id } }, 
            { new: true } 
        );
        
        return res.status(200).json({
            msg: "New project added successfully.",
            newProjectId: newProject._id
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.get('/', userMiddleware, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id });

        return res.status(200).json({
            projects
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.get('/:id', userMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if(!project || project.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Project not found."
            });
        }

        return res.status(200).json({
            project: project
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
        const response = projectSchemaZod.safeParse(data);

        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong inputs."
            });
        }

        const { topic, description, github_link, tech_stack, date } = req.body;
        const project = await Project.findById(req.params.id);

        if(!project || project.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Project not found."
            });
        }

        project.topic = topic || project.topic;
        project.description = description || project.description;
        project.github_link = github_link || project.github_link;
        project.tech_stack = tech_stack || project.tech_stack;
        project.date = date || project.date;

        await project.save();

        return res.status(200).json({
            msg: "Project updated successfully."
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.delete('/:id', userMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if(!project || project.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Project not found."
            });
        }

        await project.deleteOne();

        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { projects: project._id } }
        );

        return res.status(200).json({
            msg: "Project deleted successfully."
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;
