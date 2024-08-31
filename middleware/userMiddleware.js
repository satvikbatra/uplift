const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const { User } = require('../models/user');

async function userMiddleware(req, res, next) {
    const token = req.headers.authorization;
    const words = token.split(" ");
    const jwtToken = words[1];
    const decoded = jwt.verify(jwtToken, process.env.JWT_PASSWORD);

    const currentUser = await User.findOne({
        organization_email_id: decoded.organization_email_id
    })

    if(decoded.organization_email_id) {
        req.organization_email_id = decoded.organization_email_id;
        req.user = currentUser;
        next();
    } else {
        return res.status(403).json({
            msg: "You are not authorized."
        });
    }
}

module.exports = { userMiddleware };