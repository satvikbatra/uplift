const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

dotenv.config();
const { User } = require('../models/user');

async function adminMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization;
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token missing or malformed." });
        }

        const jwtToken = token.split(" ")[1];
        const decoded = jwt.verify(jwtToken, process.env.JWT_PASSWORD);

        const currentAdmin = await User.findOne({
            organization_email_id: decoded.organization_email_id
        });

        if (!currentAdmin || !currentAdmin.is_admin) {
            return res.status(403).json({ message: "You are not authorized." });
        }

        // Set the relevant information in the request object
        req.organization_email_id = decoded.organization_email_id;
        req.user = currentAdmin;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error in adminMiddleware:", error.message);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token." });
        }
        return res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = { adminMiddleware };
