//This will be used to create a group and enter a group
const express= require("express");
const router= express.Router();
const db= require("../Config/db.js");
const userdb= db.User;
const groupdb= db.Group;
const saltRounds= 12;
const bcrypt= require("bcryptjs");
router.use(express.json());
const jwtchecker= require("../Helper/jwtchecker.js");  //This middleware checks the jwt token in the Authorization header.


router.post("/creategroup",jwtchecker, async function(req,res){     //This routing function is used to create a group
    try{    
        const body= req.body;    //body will consist of name, passcode
        const myusername= req.myusername;   //username of the currently logged in user
        const newgrp= await groupdb.create({   //Creating new group, and adding document in groupdb
            name: body.name,
            passcode: await bcrypt.hash(body.passcode,saltRounds),
            participants: [myusername],
            expenses: [],
            createdAt: new Date()
        });

        const newentry= await userdb.updateOne(   //Adding group name in the groups array in user db
            {username:myusername},
            {
                $push:{
                    groups: body.name
                }
            }
        );

        res.status(200).json({
            msg:"Successfully created the group"
        })
    }
    catch(error){
        res.status(500).json({
            msg:"Unable to create the group",
            error: error.message
        });
    }
});


router.post("/enter", jwtchecker, async function(req, res) {   //Routing function to enter group
    try {
        const body = req.body;   // Group name and passcode
        const mygrp = await groupdb.findOne({
            name: body.name
        });

        if (mygrp) {
            const result = await bcrypt.compare(body.passcode, mygrp.passcode);    
            if (result) {
                // Push the username into the participants array in group db
                const newentry = await groupdb.updateOne(
                    {name: body.name},
                    {
                        $push: {
                            participants: req.myusername
                        }
                    }
                );

                //update the user db
                const newgrp= await userdb.updateOne(
                    {username: req.myusername},
                    {
                        $push:{
                            groups: body.name
                        }
                    }
                )

                res.status(200).json({
                    msg: "User added to the group successfully",
                });
            } else {
                res.status(403).json({
                    msg: "Incorrect password entered"
                });
            }
        } else {
            res.status(404).json({
                msg: "This group does not exist"
            });
        }
    } catch (error) {
        res.status(500).json({
            msg: "An error occurred",
            error: error.message
        });
    }
});


module.exports= router;