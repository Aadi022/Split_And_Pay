//This checks if username, email exists in the database and the entered body is in valid format
const zod= require("zod");
const db= require("../Config/db.js");
const userdb= db.User;

async function login(req,res,next){
    const body= req.body;   //body will have username, email and password
    const loginbody= zod.object({
        username: zod.string(),
        email: zod.string().email(),
        password: zod.string()
    });

    const result= loginbody.safeParse(body);

    if(!result.success){
        res.status(400).json({
            msg:"Incorrect format of credentials"
        });
    }

    else{
        const mydoc= await userdb.findOne({
            username: body.username,
            email: body.email
        });

        if(mydoc){
            req.mydoc= mydoc;
            next();
        }
        else{
            res.status(404).json({
                msg:"Username or Email doesn't exist"
            });
        }
    }
}


module.exports= login;