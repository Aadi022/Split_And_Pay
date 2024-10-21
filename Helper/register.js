//This middleware will be used in signup routing function. This will check if the entered credentials are of valid format, and if the username, email and number are unique
const db= require("../Config/db.js");
const userdb= db.User;
const zod= require("zod");

const signupSchema= zod.object({
    name: zod.string(),
    email: zod.string().email(),
    mobile: zod.number(),
    username: zod.string(),
    password: zod.string(),
});

async function register(req,res,next){
    const body= req.body;
    const result= signupSchema.safeParse(body);
    if(!result.success){
        res.status(400).json({
            msg:"Invalid format entered"
        });
    }
    else{
        const val1= await userdb.findOne({  //Finds if username already exists in the database
            username: body.username
        });

        const val2= await userdb.findOne({  //Finds if email already exists in the database
            email: body.email
        });

        if(val1){
            res.status(403).json({
                msg:"Username already exists"
            });
        }
        else if(val2){
            res.status(403).json({
                msg:"Email already exists"
            });
        }
        else{
            next();
        }
    }
}

module.exports= register;