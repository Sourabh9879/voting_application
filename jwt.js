const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req,res,next) => {
// first check request headers has authorization or not
const authorization = req.headers.authorization
if(!authorization){ 
    return res.status(401).json({err:"token not found"});
}
// extract the jwt token from the req headers
const token = req.headers.authorization.split(' ')[1];

if(!token) return res.status(401).json({error : 'unauthorized'});

try {
    // verifying jwt token
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    // attach our information to the req object
    req.user = decoded;
    next();
} catch (error) {
    console.log(error)
    res.status(401).json({err:"invalid token"});
}
}
// function to generate the jwt token

const generateToken = (userData) => {
    // generate new token using user data
    return jwt.sign(userData,process.env.JWT_SECRET);
}

module.exports = { jwtAuthMiddleware , generateToken };