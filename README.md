# Faculty Self-Appraisal System

A comprehensive web application for managing and evaluating faculty achievements, including research papers, seminars, projects, certificates, and other achievements. The system also generates ratings using AI (simulated OpenAI responses) for the listed items and stores them in the database.

## Features

- **User Authentication**: Users can sign up, log in, and manage their profiles.
- **Research Papers**: Submit and manage research papers. AI-generated ratings are provided.
- **Seminars**: Track and rate faculty seminar activities.
- **Projects**: Record and rate academic projects.
- **Certificates**: Manage and rate certificates of achievement.
- **Other Achievements**: Log and rate any other significant accomplishments.
- **Admin Functionality**: Centralized management of all activities and ratings.
- **Average Rating**: Automatic calculation of average ratings for each user.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Frontend**: React (or mention if it's included)
- **Authentication**: JWT
- **Validation**: Zod for validation
- **AI Rating Generation**: Simulated AI responses for ratings
- **Deployment**: Deployed and fully functional on https://seft-appraisal.onrender.com/

## Routes

### User Routes

- **POST** `/user/register`: Register a new user.
- **POST** `/user/login`: Login for existing users.
- **GET** `/user/profile`: Fetch user profile data.
- **PUT** `/user/update`: Update user details.
  
### Research Paper Routes

- **POST** `/research/add`: Add a new research paper.
- **GET** `/research/list`: Fetch all research papers for the logged-in user.
- **PUT** `/research/update/:id`: Update a research paper.
- **DELETE** `/research/delete/:id`: Delete a research paper.
- **GET** `/generateRatings/research`: Generate and update research paper ratings.

### Seminar Routes

- **POST** `/seminar/add`: Add a new seminar.
- **GET** `/seminar/list`: Fetch all seminars for the logged-in user.
- **PUT** `/seminar/update/:id`: Update seminar details.
- **DELETE** `/seminar/delete/:id`: Delete a seminar.
- **GET** `/generateRatings/seminar`: Generate and update seminar ratings.

### Project Routes

- **POST** `/project/add`: Add a new project.
- **GET** `/project/list`: Fetch all projects for the logged-in user.
- **PUT** `/project/update/:id`: Update project details.
- **DELETE** `/project/delete/:id`: Delete a project.
- **GET** `/generateRatings/project`: Generate and update project ratings.

### Certificate Routes

- **POST** `/certificate/add`: Add a new certificate.
- **GET** `/certificate/list`: Fetch all certificates for the logged-in user.
- **PUT** `/certificate/update/:id`: Update certificate details.
- **DELETE** `/certificate/delete/:id`: Delete a certificate.
- **GET** `/generateRatings/certificate`: Generate and update certificate ratings.

### Other Achievements Routes

- **POST** `/otherAchievement/add`: Add a new achievement.
- **GET** `/otherAchievement/list`: Fetch all other achievements for the logged-in user.
- **PUT** `/otherAchievement/update/:id`: Update achievement details.
- **DELETE** `/otherAchievement/delete/:id`: Delete an achievement.
- **GET** `/generateRatings/otherAchievement`: Generate and update other achievements ratings.

### Admin Routes

- **GET** `/generateRatings/all`: Generate and update ratings for all items (research papers, seminars, projects, certificates, and other achievements).
- **GET** `/admin/dashboard`: Access admin dashboard for centralized control.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/self-appraisal-system.git
   cd self-appraisal-system

2. **Install dependencies:**
   ```bash
   npm install

3. **Set up environment variables:**
   Create a .env file in the root directory with the following variables:
   ```bash
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key

5. **Run the server:**
   ```bash
   npm start

