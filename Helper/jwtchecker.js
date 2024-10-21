//This will be called for almost every route, as it verifies the jwt token from the headers-authorization
const JWT_SECRET= require("../config");
const jwt= require("jsonwebtoken");

function authMiddleware(req,res,next){
    const authHeader= req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){    //This checks if authorization is not present or it doesn't start with 'bearer'
        return res.status(403).json({});   //Forbidden status code
    }

    const token= authHeader.split(' ')[1];  //This split method splits the string into an array of substring, and chooses the first index. So the array will be- ['bearer','jwttoken']

    try{
        const decoded= jwt.verify(token, JWT_SECRET);
        req.myusername= decoded.username;   //This req.myusername can be called in the routing function where we call this middleware. By this we can access to the username.
        next();
    }
    catch{
        return res.status(403).json({
            msg:"Unauthorized user"
        });
    }
}

module.exports=authMiddleware;