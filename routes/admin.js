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
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

async function updateAverageRatings(modelName) {
    const Model = require(`../models/${modelName}`);
    try {
        const users = await User.find();
        
        for (const user of users) {
            const documents = await Model.find({ user: user._id });

            if (documents.length === 0) {
                user.averageRating = 0;
            } else {
                const totalRating = documents.reduce((sum, doc) => sum + (doc.rating || 0), 0);
                user.averageRating = totalRating / documents.length;
            }

            await user.save();
        }

        console.log(`${modelName} ratings updated successfully.`);
    } catch (err) {
        console.error(`Error updating ${modelName} ratings:`, err.message);
    }
}

async function updateAllRatings() {
    try {
        await updateAverageRatings('research');
        await updateAverageRatings('seminar');
        await updateAverageRatings('certificates');
        await updateAverageRatings('projects');
        await updateAverageRatings('otherAchievements');

        console.log('All ratings updated successfully.');
    } catch (err) {
        console.error('Error updating all ratings:', err.message);
    }
}

async function rateResearchPapers(researchPapers) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const ratedPapers = [];

    for (const paper of researchPapers) {
        const prompt = `Rate this research paper:\nTitle: ${paper.title}\nDescription: ${paper.description}\nProvide a rating from 1 to 10.`;

        try {
            const result = await model.generateContent([
                { text: prompt }
            ]);

            const responseText = result.response.text();

            const ratingMatch = responseText.match(/(\d+\.\d+)/);
            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

            ratedPapers.push({
                _id: paper._id,
                rating: rating
            });
        } catch (error) {
            console.error(`Error rating paper ${paper._id}:`, error.message);
            ratedPapers.push({
                _id: paper._id,
                rating: null
            });
        }
    }

    return ratedPapers;
}

router.get('/researchPapersWithRatings', adminMiddleware, async (req, res) => {
    try {
        const researchPapers = await Research.find({}, 'user title description conferenceName');

        if (researchPapers.length === 0) {
            return res.status(404).json({
                msg: "No research papers found. Please try again later."
            });
        }

        const ratedPapers = await rateResearchPapers(researchPapers);

        for (let i = 0; i < ratedPapers.length; i++) {
            const paper = await Research.findById(ratedPapers[i]._id);
            paper.rating = ratedPapers[i].rating;
            // await paper.save();
        }

        res.status(200).json({
            researchPapers
        });

    } catch (err) {
        console.error('Error in /researchPapersWithRatings:', err.message);
        res.status(500).json({
            error: err.message
        });
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
        const aiGeneratedRatings = aiGeneratedRatingsText
            .split('\n')
            .map(rating => parseFloat(rating))
            .filter(rating => !isNaN(rating));

        if (aiGeneratedRatings.length !== combinedData.length) {
            throw new Error(`Mismatch: ${aiGeneratedRatings.length} ratings for ${combinedData.length} items.`);
        }

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

const updateModelRatings = async (model, data) => {
    let currentIndex = 0;
    return Promise.all(data.map(async (item) => {
        item.rating = aiGeneratedRatings[currentIndex++] || 0;
        await item.save();
        return item;
    }));
};

router.get('/generateRatings', adminMiddleware, async (req, res) => {
    try {
        // Fetch data
        const researchPapers = await Research.find({});
        const certificates = await Certificate.find({});
        const seminars = await Seminar.find({});
        const otherAchievements = await OtherAchievements.find({});
        const projects = await Project.find({});

        // Combine data and format for AI
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
        const aiGeneratedRatings = aiGeneratedRatingsText.split('\n').map(rating => parseFloat(rating)).filter(rating => !isNaN(rating));

        // Generalized function to update ratings
        const updateModelRatings = async (model, items, ratings) => {
            let currentIndex = 0;
            return Promise.all(items.map(async (item) => {
                item.rating = ratings[currentIndex++] || 0;
                await item.save();
                return item;
            }));
        };

        // Update ratings for each model
        await updateModelRatings(Research, researchPapers, aiGeneratedRatings.slice(0, researchPapers.length));
        await updateModelRatings(Certificate, certificates, aiGeneratedRatings.slice(researchPapers.length, researchPapers.length + certificates.length));
        await updateModelRatings(Seminar, seminars, aiGeneratedRatings.slice(researchPapers.length + certificates.length, researchPapers.length + certificates.length + seminars.length));
        await updateModelRatings(OtherAchievements, otherAchievements, aiGeneratedRatings.slice(researchPapers.length + certificates.length + seminars.length, researchPapers.length + certificates.length + seminars.length + otherAchievements.length));
        await updateModelRatings(Project, projects, aiGeneratedRatings.slice(researchPapers.length + certificates.length + seminars.length + otherAchievements.length));

        // Update average ratings in the User schema
        const allItems = [
            ...researchPapers,
            ...certificates,
            ...seminars,
            ...otherAchievements,
            ...projects
        ];

        // Aggregate ratings by user
        const userRatings = {};

        allItems.forEach(item => {
            if (!userRatings[item.user]) {
                userRatings[item.user] = { total: 0, count: 0 };
            }
            userRatings[item.user].total += item.rating;
            userRatings[item.user].count += 1;
        });

        // Update average rating for each user
        for (const userId in userRatings) {
            const { total, count } = userRatings[userId];
            const averageRating = total / count;
            await User.findByIdAndUpdate(userId, { averageRating }, { new: true });
        }

        // Assuming updateAllRatings is another function you have
        await updateAllRatings();

        return res.status(200).json({
            message: 'Ratings updated successfully'
        });
    } catch (err) {
        console.error('Error in /generateRatings:', err.message);
        if (err.response) {
            console.error('Response Data:', err.response.data);
            console.error('Response Status:', err.response.status);
            console.error('Response Headers:', err.response.headers);
        }
        console.error('Stack Trace:', err.stack);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;