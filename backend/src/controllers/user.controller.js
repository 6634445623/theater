const user = require("../services/user.service")

async function auth(req, res, next) {
    try {
        if (!req.body.user || !req.body.password) {
            const error = new Error("User and password are required");
            error.statusCode = 400;
            error.log = false;
            return next(error);
        }

        const token = await user.authen(req.body.user, req.body.password);
        
        res.json({ token });
    } catch (err) {
        console.error(`Error while authenticating user`, err.message);
        next(err);
    }
}

async function insertUser(req, res, next) {
    try {
        if (!req.body.user || !req.body.password) {
            const error = new Error("User and password are required");
            error.statusCode = 400;
            error.log = false;
            return next(error);
        }

        const msg = await user.insertUser(req.body.user, req.body.password);
        
        res.json({ msg });
    } catch (err) {
        console.error(`Error while authenticating user`, err.message);
        next(err);
    }
}

module.exports = {
    auth,
    insertUser
}