const express= require("express");
const app=express();
const port=3000;
const mainrouter= require("./Routes/routes.js");
const cors= require("cors");
const bodyparser= require("body-parser");
const JWT_SECRET= require("./config");

//middlewares
app.use(cors());
app.use(bodyparser.json());  //Helps in parsing json objects
app.use(mainrouter);  //All routes will be sent to mainrouter



app.listen(3000,()=>{
    console.log("The server is running on port",port);
})