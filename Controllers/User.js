//This will be used for signup and signin
const express= require("express");
const router= express.Router();
const db= require("../Config/db.js");
const userdb= db.User;
const bcrypt= require("bcryptjs");
const saltRounds= 12;
const jwt= require("jsonwebtoken");
const JWTsecret= require("../config.js");
router.use(express.json());
const registermiddleware= require("../Helper/register.js");   //This is the register middleware for validataion
const loginmiddleware= require("../Helper/login.js");  //This is the login middleware for validation

router.post("/signup", registermiddleware ,async function(req,res){  //signup routing function
    try{
        const body= req.body;    //body will have name, email, username, mobile, password, balance: owes(empty), owed_by(empty)
        const newuser= userdb.create({
            name: body.name,
            email: body.email,
            username: body.username,
            mobile: body.mobile,
            password: await bcrypt.hash(body.password,saltRounds),
            groups: [],
            balance: {
                owes:[],
                owed_by: []
            }
        });

        const token= jwt.sign({username: newuser.username}, JWTsecret);  //creating token
        res.status(200).json({
            msg: "User has been created successfully"
        });
    }
    catch(error){
        res.status(500).json({
            msg:"Unable to create the user",
            error: error.message
        });
    }
});


router.post("/signin",loginmiddleware,async function(req,res){
    try{
        const body= req.body;  //body will have username, email and password
        const mydoc= req.mydoc;

        const result= await bcrypt.compare(body.password,mydoc.password);  //Comparing entered password with the hashed password
        if(result){
            const token= jwt.sign({username:body.username},JWTsecret);
            res.status(200).json({
                msg:"You have successfully logged in",
                token: token
            });
        }
        else{
            res.status(403).json({
                msg:"Incorrect password entered"
            });
        }
    }catch(error){
        res.status(500).json({
            msg:"Unable to Log-In",
            error: error.message
        });
    }
})

module.exports= router;