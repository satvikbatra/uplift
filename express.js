const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./db');
const userRoutes = require('./routes/user');
const researchRoutes = require('./routes/research');
const seminarRoutes = require('./routes/seminar');
const projectsRoutes = require('./routes/projects');
const otherAchievementsRoutes = require('./routes/otherAchievements');
const certificatesRoutes = require('./routes/certificates');
const adminRoutes = require('./routes/admin');
const PORT = process.env.PORT || 3000;

connectDB();

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
