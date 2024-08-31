const express = require('express');
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

app.use(express.json());

app.use('/routes/user', userRoutes);
app.use('/routes/research', researchRoutes);
app.use('/routes/seminar', seminarRoutes);
app.use('/routes/projects', projectsRoutes);
app.use('/routes/otherAchievements', otherAchievementsRoutes);
app.use('/routes/certificates', certificatesRoutes);

app.listen(PORT);