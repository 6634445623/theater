const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../configs/general.config").JWTScrt;

function authenticateJWT(req, res, next) {
    const token = req.header("Authorization");

    const protectRoute = [
        "seat",
        "reciept",
        "ticket",
    ]

    if (!req.url.split("/")[2] || !protectRoute.includes(req.url.split("/")[2].toLowerCase())) {
        return next();
    }

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid or Expired Token" });
    }
}


module.exports = {
    authenticateJWT
}