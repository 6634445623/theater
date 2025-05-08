const express = require("express");
const app = express();
const port = require("./src/configs/general.config").port || 5000;

const {errorHandle} = require("./src/middlewares/error.middleware")
const {log} = require("./src/middlewares/log.middleware")
const {authenticateJWT} = require("./src/middlewares/auth.middleware")
const init = require("./src/services/init.service")

const v1 = require("./src/routes/v1.route")

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