const express = require("express");
const cors = require("cors");
const app = express();
const port = require("./src/configs/general.config").port || 5000;

const {errorHandle} = require("./src/middlewares/error.middleware")
const {log} = require("./src/middlewares/log.middleware")
// Assuming authenticateJWT is already modified to handle OPTIONS requests correctly from our previous discussion
const {authenticateJWT} = require("./src/middlewares/auth.middleware")
const init = require("./src/services/init.service")

const v1 = require("./src/routes/v1.route")

// Configure CORS to allow all origins
app.use(cors({
    origin: '*', // Allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Ensure these are sufficient
    credentials: false // Explicitly set to false or remove if using origin: '*'
    // If you remove it, and origin is '*', credentials support is typically disabled.
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

init.database().then((mes) => {
    console.log(mes)
})

app.get('/', (req, res) => {
    res.json({'message': 'ok'});
})

app.use(log)
app.use(authenticateJWT) // Ensure this middleware correctly bypasses OPTIONS requests

app.use("/v1", v1)

app.use(errorHandle);

app.listen(port, (err) => {
    if(!err){
        console.log("Listening on port: " + port)
    }else{
        console.log("There is a problem when starting up: " + err)
    }
})