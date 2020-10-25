const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();

module.exports = (req, res, next) => {
    try {
        const decodedToken = jwt.verify(req.body.token, process.env.JWT_KEY);
        req.userData = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'auth failed'
        })
    }
}