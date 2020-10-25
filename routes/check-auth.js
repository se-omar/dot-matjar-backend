const jwt = require('jsonwebtoken')
// const dotenv = require('dotenv');
// dotenv.config();

module.exports = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== undefined) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }
    else {
        res.status(403);
    }
    // try {
    //     const decodedToken = jwt.verify(req.body.token, process.env.JWT_KEY);
    //     req.userData = decodedToken;
    //     next();
    // } catch (error) {
    //     return res.status(401).json({
    //         message: 'auth failed'
    //     })
    // }
}