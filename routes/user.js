const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { userMainSchemaZod, userUpdatedSchemaZod } = require('../validation/user');
const { jwtPassword } = require('../config');
const bcrypt = require('bcryptjs');
const { userMiddleware } = require('../middleware/userMiddleware')

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const data = req.body;
        const response = userMainSchemaZod.safeParse(data);
        // console.log(response);
        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong inputs.",
                // errors: response.error.errors,
            })
        }

        const { is_admin, personal_email_id, organization_email_id, password, full_name } = req.body;

        const existingUser = await User.findOne({
            organization_email_id
        })

        if(existingUser) {
            return res.status(400).json({
                msg: "User already exist."
            });
        }

        const newUser = new User({
            is_admin,
            personal_email_id,
            organization_email_id,
            password,
            full_name
        });

        await newUser.save();

        res.status(200).json({
            msg: "User created successfully."
        });

    } catch(err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const username = req.body.organization_email_id;
        const password = req.body.password;

        const user = await User.findOne({
            organization_email_id: username
        })

        // console.log(user);

        if(!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                msg: "Invalid credentials."
            })
        }

        var token = jwt.sign({
            organization_email_id: username
        }, jwtPassword);

        return res.status(200).json({
            token: token
        })

    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
});

router.get('/details', userMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({
            organization_email_id: req.user.organization_email_id
        })

        // console.log(user);

        if(!user) {
            return res.status(404).json({
                msg: "User not found."
            })
        }

        res.status(200).json({
            user
        })

    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

router.post('/updateDetails', userMiddleware, async (req, res) => {
    try {
        const data = req.body;
        const response = userUpdatedSchemaZod.safeParse(data);
        // console.log(response);
        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong inputs.",
                // errors: response.error.errors,
            })
        }

        const { profile_image, phone_number, gender, department_name, researchPapers, projects, seminars, certificates, otherAchievements, latestAcadmicFeedback } = req.body;

        const updatedUser = await User.findOneAndUpdate({
            organization_email_id: req.user.organization_email_id },
            { profile_image, phone_number, gender, department_name, researchPapers, projects, seminars, certificates, otherAchievements, latestAcadmicFeedback },
            { new: true
        });

        // console.log(updatedUser);

        if(!updatedUser) {
            return res.status(404).json({
                msg: "User not found."
            })
        }
        
        res.status(200).json({
            msg: "Details updated successfully."
        })

    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
})

module.exports = router;