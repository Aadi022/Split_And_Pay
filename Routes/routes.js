const express= require("express");
const router= express.Router();
router.use(express.json());
const userRouter= require("../Controllers/User.js");
const grouprouter= require("../Controllers/Group.js");
const transactionrouter= require("../Controllers/Transaction.js");
const balancerouter= require("../Controllers/Balance.js");

router.use("/user",userRouter);
router.use("/group",grouprouter);
router.use("/transaction",transactionrouter);
router.use("/balance",balancerouter);

module.exports= router;