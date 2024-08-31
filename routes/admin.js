const express = require('express');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { userMainSchemaZod } = require('../validation/user');
const { adminMiddleware } = require('../middleware/adminMiddleware');
const { User } = require('../models/user');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const { Research } = require('../models/research');
const { Seminar } = require('../models/seminar');
const { Certificate } = require('../models/certificates');
const { OtherAchievements } = require('../models/otherAchievements');

router.post('/register', async (req, res) => {
    try {
        const data = req.body;
        const response = userMainSchemaZod.safeParse(data);

        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong input."
            });
        }

        const { is_admin, personal_email_id, organization_email_id, password, full_name } = req.body;

        const existingAdmin = await User.findOne({
            organization_email_id
        });

        if(existingAdmin) {
            return res.status(400).json({
                msg: "Admin already exist."
            })
        }

        const newAdmin = await new User({
            is_admin,
            personal_email_id,
            organization_email_id,
            password,
            full_name
        });

        await newAdmin.save();

        return res.status(200).json({
            msg: "Admin created successfully.",
        });


    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

router.post('/signin', async (req, res) => {
    try {
        const { organization_email_id, password } = req.body;

        const admin = await User.findOne({
            organization_email_id: organization_email_id
        });
        // console.log(admin);
        if(!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({
                msg: "Invalid credentials."
            })
        }

        var token = jwt.sign({
            organization_email_id: organization_email_id
        }, process.env.JWT_PASSWORD);

        return res.status(200).json({
            token: token
        })

    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

router.get('/researchPapers', adminMiddleware, async (req, res) => {
    try {
        const researchPapers = await Research.find({ }, 'user title description conference_name');

        if(!researchPapers) {
            return res.status(404).json({
                msg: "Research papers not found. Please try again later."
            })
        }

        return res.status(200).json({
            researchPapers: researchPapers
        })
    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

router.get('/seminars', async (req, res) => {
    try {
        const seminars = await Seminar.find({ }, 'user title description location role');

        if(!seminars) {
            return res.status(404).json({
                msg: "Seminars not found. Please try again later."
            });
        }

        return res.status(200).json({
            seminars: seminars
        })
    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

router.get('/projects', async (req, res) => {
    try {
        const projects = await Seminar.find({ }, 'user title description tech_stack');

        if(!projects) {
            return res.status(404).json({
                msg: "Projects not found. Please try again later."
            });
        }

        return res.status(200).json({
            projects: projects
        })
    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

router.get('/certificates', async (req, res) => {
    try {
        const certificates = await Certificate.find({ }, 'platform field topic description');

        if(!certificates) {
            return res.status(404).json({
                msg: "Certificates not found. Please try again later."
            });
        }

        return res.status(200).json({
            certificates: certificates
        })
    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

router.get('/otherAchievements', async (req, res) => {
    try {
        const otherAchievements = await OtherAchievements.find({ }, 'platform field topic description');

        if(!otherAchievements) {
            return res.status(404).json({
                msg: "Other Achievements not found. Please try again later."
            });
        }

        return res.status(200).json({
            otherAchievements: otherAchievements
        })
    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

module.exports = router;