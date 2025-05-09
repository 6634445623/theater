// ./src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../configs/general.config").JWTScrt;

function authenticateJWT(req, res, next) {
    // **Allow OPTIONS requests to pass through immediately**
    // This is crucial for CORS preflight requests.
    if (req.method === 'OPTIONS') {
        console.log('Auth middleware: OPTIONS request, bypassing JWT check for path:', req.url);
        return next();
    }

    const authHeader = req.header("Authorization");
    console.log('Auth middleware: Received auth header:', authHeader ? 'Present' : 'Missing');
    console.log('Auth middleware: JWT_SECRET:', JWT_SECRET ? 'Present' : 'Missing');

    const protectRoute = [
        "seat",
        "receipt",
        "ticket",
        "bookings"
    ];

    // Extract the relevant part of the URL path for checking against protectRoute.
    const pathSegments = req.url.split("?")[0].split("/");
    const routeSegmentToCheck = pathSegments[2] ? pathSegments[2].toLowerCase() : null;
    console.log('Auth middleware: Checking route:', routeSegmentToCheck);

    if (!routeSegmentToCheck || !protectRoute.includes(routeSegmentToCheck)) {
        console.log('Auth middleware: Public route or not in protectRoute, skipping token check for:', req.url);
        return next();
    }

    if (!authHeader) {
        console.log('Auth middleware: Access Denied - No Token Provided for protected route:', req.url);
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        const token = authHeader.replace("Bearer ", "");
        console.log('Auth middleware: Verifying token for protected route:', req.url);
        console.log('Auth middleware: Token value:', token);
        console.log('Auth middleware: Token length:', token.length);
        const verified = jwt.verify(token, JWT_SECRET);
        console.log('Auth middleware: Token verified successfully:', verified);
        req.user = verified;
        next();
    } catch (err) {
        console.log('Auth middleware: Token verification failed:', err.message);
        console.log('Auth middleware: Token that failed:', authHeader);
        res.status(403).json({ message: "Invalid or Expired Token" });
    }
}

async function requireAdmin(req, res) {
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
        throw new Error("Access Denied: No Token Provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const verified = jwt.verify(token, JWT_SECRET);
    
    if (!verified || !verified.is_admin) {
        throw new Error("Access Denied: Admin privileges required");
    }
    
    req.user = verified;
}

module.exports = {
    authenticateJWT,
    requireAdmin
};