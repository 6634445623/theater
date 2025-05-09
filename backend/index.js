const express = require("express");
const cors = require("cors");
const app = express();
const config = require("./src/configs/general.config");
const port = config.port;

const {errorHandle} = require("./src/middlewares/error.middleware")
const {log} = require("./src/middlewares/log.middleware")
const {authenticateJWT} = require("./src/middlewares/auth.middleware")
const init = require("./src/services/init.service")
const v1 = require("./src/routes/v1.route")

// Configure CORS with secure settings
app.use(cors({
    origin: config.allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    // Add security headers
    exposedHeaders: ['Content-Length', 'X-Content-Type-Options'],
}));

// Add security headers
app.use((req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    });
    next();
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

init.database().then((mes) => {
    console.log(mes)
})

app.get('/', (req, res) => {
    res.json({'message': 'ok'});
})

app.use(log)
app.use(authenticateJWT)

app.use("/v1", v1)

app.use(errorHandle);

app.listen(port, (err) => {
    if(!err){
        console.log("Listening on port: " + port)
    }else{
        console.log("There is a problem when starting up: " + err)
    }
})