const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { userMainSchemaZod, userUpdatedSchemaZod } = require('../validation/user');
const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcryptjs');
const { userMiddleware } = require('../middleware/userMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Appraisal } = require('../models/appraisal');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

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
        }, process.env.JWT_PASSWORD);

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

router.post('/updateDetails', userMiddleware, upload.single('profile_image'), async (req, res) => {
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

        const { phone_number, gender, department_name, role, researchPapers, projects, seminars, certificates, otherAchievements, latestAcadmicFeedback } = req.body;
        
        // Create update object
        const updateData = {
            phone_number, 
            gender, 
            department_name, 
            role, 
            researchPapers, 
            projects, 
            seminars, 
            certificates, 
            otherAchievements, 
            latestAcadmicFeedback
        };
        
        // Add profile image path if file was uploaded
        if (req.file) {
            updateData.profile_image = `/uploads/${req.file.filename}`;
        }

        const updatedUser = await User.findOneAndUpdate({
            organization_email_id: req.user.organization_email_id },
            updateData,
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

router.post('/applyAppraisal', userMiddleware, async (req, res) => {
    const userId = req.user._id;

    try {
      // Check if user already has a pending appraisal
      const existingAppraisal = await Appraisal.findOne({ user: userId, status: 'pending' });
      
      if (existingAppraisal) {
        return res.status(400).json({
          msg: "You already have a pending appraisal request."
        });
      }
      
      const newAppraisal = new Appraisal({
          user: userId
      });

      await newAppraisal.save();

      res.status(200).json({
          msg: "Appraisal applied successfully."
      });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.get('/appraisals', userMiddleware, async (req, res) => {
    try {
        const appraisals = await Appraisal.find({ user: req.user._id })
            .populate('user', 'organization_email_id full_name department_name role')
            .sort({ appliedAt: -1 });

        if (!appraisals.length) {
            return res.status(404).json({
                msg: "No appraisals found."
            });
        }

        return res.status(200).json({
            appraisals: appraisals
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;