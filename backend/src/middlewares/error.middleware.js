

async function errorHandle(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const logErr = (err.log === undefined) ? true : err.log === false ? false : err.log;
    if(logErr)
        console.error(err.message, err.stack);
    res.status(statusCode).json({'message': err.message});
    
    return;
}

module.exports = {
    errorHandle
}