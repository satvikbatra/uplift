const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const { connectToMongoDB } = require('./db');
const userRouter = require('./routes/user');
const researchRouter = require('./routes/research');
const seminarRouter = require('./routes/seminar');
const certificateRouter = require('./routes/certificates');
const otherAchievementsRouter = require('./routes/otherAchievements');
const projectRouter = require('./routes/projects');
const adminRouter = require('./routes/admin');
const appraisalRouter = require('./routes/appraisal');
const PORT = process.env.PORT || 3000;

connectToMongoDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/user', userRoutes);
app.use('/researchPapers', researchRoutes);
app.use('/seminars', seminarRoutes);
app.use('/projects', projectsRoutes);
app.use('/otherAchievements', otherAchievementsRoutes);
app.use('/certificates', certificatesRoutes);
app.use('/admin', adminRoutes);

app.listen(PORT);
