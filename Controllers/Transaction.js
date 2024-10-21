//This will handle the transaction
const express= require("express");
const router= express.Router();
const db= require("../Config/db.js");
const userdb= db.User;
const groupdb= db.Group;
router.use(express.json());
const jwtchecker= require("../Helper/jwtchecker.js");

router.post("/addExpense", jwtchecker, async function(req, res) {
    try {
        const body = req.body;   // Body should have groupName, totalAmount, splitMethod, and splitDetails
        const myusername = req.myusername;  // Get the username from the JWT token

        // Fetch the group from the database
        const mygrp = await groupdb.findOne({ name: body.groupName });

        if (!mygrp) {
            return res.status(404).json({
                msg: "Group not found"
            });
        }

        // Check if the user is a participant of the group
        if (!mygrp.participants.includes(myusername)) {
            return res.status(403).json({
                msg: "You are not a participant of this group"
            });
        }

        // Calculate how much each participant owes based on the split method
        const totalAmount = body.totalAmount;
        const splitMethod = body.splitMethod;
        let transactions = [];

        // To store how much each user owes/owed by
        let updatesToUserBalance = [];

        if (splitMethod === "equal") {
            const perPerson = totalAmount / mygrp.participants.length;
            mygrp.participants.forEach(function(user) {
                transactions.push({ user: user, amount: perPerson });

                // Skip the logged-in user (payer), they shouldn't owe money to themselves
                if (user !== myusername) {
                    // Update the other participants' owes and owed_by
                    updatesToUserBalance.push({
                        owes: { to: myusername, amount: perPerson },    // This user owes the payer
                        owed_by: { from: user, amount: perPerson }      // Payer is owed by this user
                    });
                }
            });
        } 
        else if (splitMethod === "exact") {
            const splitDetails = body.splitDetails; // Array of { user: "username", amount: number }

            let totalSplit = 0;
            splitDetails.forEach(function(detail) {
                totalSplit += detail.amount;
                transactions.push({ user: detail.user, amount: detail.amount });

                // Add balance updates for everyone except the person who paid
                if (detail.user !== myusername) {
                    updatesToUserBalance.push({
                        owes: { to: myusername, amount: detail.amount },
                        owed_by: { from: detail.user, amount: detail.amount }
                    });
                }
            });

            if (totalSplit !== totalAmount) {
                return res.status(400).json({
                    msg: "Total exact split amounts do not add up to the total amount"
                });
            }
        } 
        else if (splitMethod === "percentage") {
            const splitDetails = body.splitDetails; // Array of { user: "username", percentage: number }

            let totalPercentage = 0;
            splitDetails.forEach(function(detail) {
                totalPercentage += detail.percentage;
                const amountOwed = (totalAmount * detail.percentage) / 100;
                transactions.push({ user: detail.user, amount: amountOwed });

                // Add balance updates for everyone except the person who paid
                if (detail.user !== myusername) {
                    updatesToUserBalance.push({
                        owes: { to: myusername, amount: amountOwed },  // Correct calculation for each user
                        owed_by: { from: detail.user, amount: amountOwed }
                    });
                }
            });

            if (totalPercentage !== 100) {
                return res.status(400).json({
                    msg: "Total percentages do not add up to 100%"
                });
            }
        } 
        else {
            return res.status(400).json({
                msg: "Invalid split method. Use 'equal', 'exact', or 'percentage'"
            });
        }

        // Add the new expense to the group
        const newExpense = {
            paid_by: myusername,
            total_amount: totalAmount,
            split_method: splitMethod,
            transactions: transactions
        };

        await groupdb.updateOne(
            { name: body.groupName },
            { $push: { expenses: newExpense } }
        );

        // Now update each participant's balance in userdb for percentage-wise split
        for (let i = 0; i < updatesToUserBalance.length; i++) {
            let update = updatesToUserBalance[i];

            // Update the user who owes money
            await userdb.updateOne(
                { username: update.owed_by.from },  // The user who owes money (ensure proper target)
                { 
                    $push: { 
                        "balance.owes": { 
                            groupName: body.groupName, 
                            to: myusername,   // They owe money to the payer
                            amount: update.owes.amount  // Correct amount based on percentage
                        }
                    }
                }
            );

            // Update the payer (myusername) for each participant who owes money
            await userdb.updateOne(
                { username: myusername },  // The payer (logged-in user)
                { 
                    $push: { 
                        "balance.owed_by": { 
                            groupName: body.groupName, 
                            from: update.owed_by.from,   // This participant owes the payer
                            amount: update.owed_by.amount  // Correct amount based on percentage
                        }
                    }
                }
            );
        }

        res.status(200).json({
            msg: "Expense added successfully",
            expense: newExpense
        });
    } 
    catch (error) {
        res.status(500).json({
            msg: "Unable to add expense",
            error: error.message
        });
    }
});




module.exports= router;