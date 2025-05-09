// ./src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../configs/general.config").JWTScrt;

function authenticateJWT(req, res, next) {
    // **Allow OPTIONS requests to pass through immediately**
    // This is crucial for CORS preflight requests.
    if (req.method === 'OPTIONS') {
        // console.log('Auth middleware: OPTIONS request, bypassing JWT check for path:', req.url); // For debugging
        return next();
    }

    const token = req.header("Authorization");

    const protectRoute = [
        "seat",
        "receipt",
        "ticket",
    ];

    // Extract the relevant part of the URL path for checking against protectRoute.
    // Assuming your routes are like /v1/seat, /v1/ticket, etc.
    // req.url might be '/v1/seat?query=123'
    const pathSegments = req.url.split("?")[0].split("/"); // Remove query params first, then split
    const routeSegmentToCheck = pathSegments[2] ? pathSegments[2].toLowerCase() : null; // e.g., 'seat' from '/v1/seat'

    // If the route segment isn't found or isn't in the protectRoute array,
    // consider it a public route (or handled by other logic).
    if (!routeSegmentToCheck || !protectRoute.includes(routeSegmentToCheck)) {
        // console.log('Auth middleware: Public route or not in protectRoute, skipping token check for:', req.url); // For debugging
        return next();
    }

    // At this point, it's a protected route, so a token is required.
    if (!token) {
        // console.log('Auth middleware: Access Denied - No Token Provided for protected route:', req.url); // For debugging
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        // console.log('Auth middleware: Verifying token for protected route:', req.url); // For debugging
        const verified = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        // console.log('Auth middleware: Invalid or Expired Token for protected route:', req.url, err.message); // For debugging
        res.status(403).json({ message: "Invalid or Expired Token" });
    }
}

module.exports = {
    authenticateJWT
};