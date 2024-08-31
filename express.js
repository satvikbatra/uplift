const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const userRoutes = require('./routes/user');
const researchRoutes = require('./routes/research');
const seminarRoutes = require('./routes/seminar');
const projectsRoutes = require('./routes/projects');
const otherAchievementsRoutes = require('./routes/otherAchievements');
const certificatesRoutes = require('./routes/certificates');
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/research', researchRoutes);
app.use('/seminar', seminarRoutes);
app.use('/projects', projectsRoutes);
app.use('/otherAchievements', otherAchievementsRoutes);
app.use('/certificates', certificatesRoutes);

app.listen(PORT);