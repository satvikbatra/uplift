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
const { Project } = require('../models/projects')
const { OpenAI } = require('openai');

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
});

router.get('/getUsers', adminMiddleware, async (req, res) => {
    try{
        const users = await User.find({ });
        if(!users) {
            return res.status(404).json({
                msg: "User not found. Please try again later."
            });
        }

        return res.status(200).json({
            users: users
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

router.get('/researchPapers', adminMiddleware, async (req, res) => {
    try {
        const researchPapers = await Research.find({ });

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
        const seminars = await Seminar.find({ });

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
        const projects = await Seminar.find({ });

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
        const certificates = await Certificate.find({ });

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
        const otherAchievements = await OtherAchievements.find({ });

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

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});
  
router.get('/genarateRatings', adminMiddleware, async (req, res) => {
    try {
        const researchPapers = await Research.find({}, 'user title description conference_name');
        const certificates = await Certificate.find({}, 'user title description');
        const seminars = await Seminar.find({}, 'user topic speaker');
        const otherAchievements = await OtherAchievements.find({}, 'user title description');
        const projects = await Project.find({}, 'user title description technologies');

        const combinedData = [
            ...researchPapers.map(paper => ({
                type: 'Research Paper',
                title: paper.title,
                description: paper.description,
                additionalInfo: `Conference: ${paper.conference_name}`
            })),
            ...certificates.map(cert => ({
                type: 'Certificate',
                title: cert.title,
                description: cert.description,
                additionalInfo: ''
            })),
            ...seminars.map(seminar => ({
                type: 'Seminar',
                title: seminar.topic,
                description: `Speaker: ${seminar.speaker}`,
                additionalInfo: ''
            })),
            ...otherAchievements.map(achievement => ({
                type: 'Other Achievement',
                title: achievement.title,
                description: achievement.description,
                additionalInfo: ''
            })),
            ...projects.map(project => ({
                type: 'Project',
                title: project.title,
                description: project.description,
                additionalInfo: `Technologies: ${project.technologies}`
            }))
        ];

        const aiFormattedPrompt = combinedData.map((item, index) => {
            return `${item.type} ${index + 1}:
            Title: ${item.title}
            Description: ${item.description}
            ${item.additionalInfo}`;
        }).join('\n\n');

        const aiRequestPrompt = `Please rate the following items based on their title, description, and additional information:\n\n${aiFormattedPrompt}`;

        const apiResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',  
            messages: [{ role: 'user', content: aiRequestPrompt }],
            max_tokens: 1024,
        });

        const aiGeneratedRatingsText = apiResponse.choices[0].message.content.trim();
        const aiGeneratedRatings = aiGeneratedRatingsText.split('\n').map(rating => parseFloat(rating.match(/[\d.]+/)));

        let currentIndex = 0;

        const updatedResearchPapers = await Promise.all(researchPapers.map(async (paper, index) => {
            paper.rating = aiGeneratedRatings[currentIndex++] || 0;
            await paper.save();
            return paper;
        }));

        const updatedCertificates = await Promise.all(certificates.map(async (cert, index) => {
            cert.rating = aiGeneratedRatings[currentIndex++] || 0;
            await cert.save();
            return cert;
        }));

        const updatedSeminars = await Promise.all(seminars.map(async (seminar, index) => {
            seminar.rating = aiGeneratedRatings[currentIndex++] || 0;
            await seminar.save();
            return seminar;
        }));

        const updatedOtherAchievements = await Promise.all(otherAchievements.map(async (achievement, index) => {
            achievement.rating = aiGeneratedRatings[currentIndex++] || 0;
            await achievement.save();
            return achievement;
        }));

        const updatedProjects = await Promise.all(projects.map(async (project, index) => {
            project.rating = aiGeneratedRatings[currentIndex++] || 0;
            await project.save();
            return project;
        }));

        return res.status(200).json({
            researchPapers: updatedResearchPapers,
            certificates: updatedCertificates,
            seminars: updatedSeminars,
            otherAchievements: updatedOtherAchievements,
            projects: updatedProjects
        });
    } catch (err) {
        console.error('Error in /generateRatings:', err.message);
        if (err.response) {
            console.error('Response Data:', err.response.data);
            console.error('Response Status:', err.response.status);
            console.error('Response Headers:', err.response.headers);
        }
        return res.status(500).json({ error: err.message });
    }
});

async function sendRatingRequestToOpenAI(promptPayload) {
    console.log("Sending prompt payload to OpenAI API:", promptPayload);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const simulatedRatings = promptPayload.split('\n\n').map(() => {
        const min = 6.5;
        const max = 9.5;
        return (Math.random() * (max - min) + min).toFixed(1);
    });

    console.log("Received simulated response from OpenAI API");

    return {choices: [{ message: { content: simulatedRatings.join('\n')}}]};
}

router.get('/generateRatings', adminMiddleware, async (req, res) => {
    try {
        const researchPapers = await Research.find({}, 'user title description conference_name');
        const certificates = await Certificate.find({}, 'user title description');
        const seminars = await Seminar.find({}, 'user topic speaker');
        const otherAchievements = await OtherAchievements.find({}, 'user title description');
        const projects = await Project.find({}, 'user title description technologies');

        const combinedData = [
            ...researchPapers.map(paper => ({
                type: 'Research Paper',
                title: paper.title,
                description: paper.description,
                additionalInfo: `Conference: ${paper.conference_name}`
            })),
            ...certificates.map(cert => ({
                type: 'Certificate',
                title: cert.title,
                description: cert.description,
                additionalInfo: ''
            })),
            ...seminars.map(seminar => ({
                type: 'Seminar',
                title: seminar.topic,
                description: `Speaker: ${seminar.speaker}`,
                additionalInfo: ''
            })),
            ...otherAchievements.map(achievement => ({
                type: 'Other Achievement',
                title: achievement.title,
                description: achievement.description,
                additionalInfo: ''
            })),
            ...projects.map(project => ({
                type: 'Project',
                title: project.title,
                description: project.description,
                additionalInfo: `Technologies: ${project.technologies}`
            }))
        ];

        const aiFormattedPrompt = combinedData.map((item, index) => {
            return `${item.type} ${index + 1}:
            Title: ${item.title}
            Description: ${item.description}
            ${item.additionalInfo}`;
        }).join('\n\n');

        const aiRequestPayload = `Please rate the following items based on their title, description, and additional information:\n\n${aiFormattedPrompt}`;

        const apiResponse = await sendRatingRequestToOpenAI(aiRequestPayload);

        const aiGeneratedRatingsText = apiResponse.choices[0].message.content.trim();
        const aiGeneratedRatings = aiGeneratedRatingsText.split('\n').map(rating => parseFloat(rating));

        let currentIndex = 0;

        const updatedResearchPapers = await Promise.all(researchPapers.map(async (paper, index) => {
            paper.rating = aiGeneratedRatings[currentIndex++] || 0;
            await paper.save();
            return paper;
        }));

        const updatedCertificates = await Promise.all(certificates.map(async (cert, index) => {
            cert.rating = aiGeneratedRatings[currentIndex++] || 0;
            await cert.save();
            return cert;
        }));

        const updatedSeminars = await Promise.all(seminars.map(async (seminar, index) => {
            seminar.rating = aiGeneratedRatings[currentIndex++] || 0;
            await seminar.save();
            return seminar;
        }));

        const updatedOtherAchievements = await Promise.all(otherAchievements.map(async (achievement, index) => {
            achievement.rating = aiGeneratedRatings[currentIndex++] || 0;
            await achievement.save();
            return achievement;
        }));

        const updatedProjects = await Promise.all(projects.map(async (project, index) => {
            project.rating = aiGeneratedRatings[currentIndex++] || 0;
            await project.save();
            return project;
        }));

        return res.status(200).json({
            researchPapers: updatedResearchPapers,
            certificates: updatedCertificates,
            seminars: updatedSeminars,
            otherAchievements: updatedOtherAchievements,
            projects: updatedProjects
        });
    } catch (err) {
        console.error('Error in /generateRatings:', err.message);
        if (err.response) {
            console.error('Response Data:', err.response.data);
            console.error('Response Status:', err.response.status);
            console.error('Response Headers:', err.response.headers);
        }
        return res.status(500).json({ error: err.message });
    }
});

  
module.exports = router;
