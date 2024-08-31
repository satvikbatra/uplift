const jwt = require("jsonwebtoken");
const { jwtPassword } = require("../config")

function adminMiddleware(req, res, next) {
    const token = req.headers.authorization;
    const words = token.split(' ');
    const jwtToken = words[1];
    const decoded = jwt.verify(jwtToken, jwtPassword);
    // console.log(decoded);

    if(decoded.username) {
        next();
    } else {
        res.status(403).json({
            message: "You are not authorized."
        })
    }
}

module.exports = adminMiddleware;