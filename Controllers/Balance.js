//This fetches the user balance and group balance
const express= require("express");
const router= express.Router();
const db= require("../Config/db.js");
const userdb= db.User;
const groupdb= db.Group;
router.use(express.json());
const jwtchecker= require("../Helper/jwtchecker.js");
const axios= require("axios");
const https = require("https");
const path = require("path");
const fs = require("fs");


const API_KEY = "aadityamta@gmail.com_m5QmSJu1hptzhFqsEwoXI8uzZXeMzB1MB0uf4D3ewCpYSRSKnvOqYfA2YQ2j1r4L";   //API Key for PDF.co

// Direct URL of source PDF file (could be your own template)
const SourceFileUrl = "https://bytescout-com.s3.amazonaws.com/files/demo-files/cloud-api/pdf-edit/sample.pdf";

// PDF document password (if needed)
const Password = "";

// Destination PDF file name
const DestinationFile = "./result.pdf";

// Add user balance to PDF as annotations
router.get('/user/download/pdf', jwtchecker, async function(req, res) {
    try {
        const myusername = req.myusername;

        // Fetch the user's balance from userdb
        const user = await userdb.findOne({ username: myusername }, 'balance');

        if (!user || !user.balance) {
            return res.status(404).json({ msg: "No balance data found for the user" });
        }

        // Prepare dynamic annotations based on user's balance
        const annotations = [];

        // Add "owes" section
        user.balance.owes.forEach((entry, index) => {
            annotations.push({
                pages: "",  
                x: 100,     // X coordinate for annotation
                y: 700 - (index * 20),  // Adjust Y position dynamically
                text: `Owes to ${entry.to}: ${entry.amount} in ${entry.groupName}`,
                fontname: "Times New Roman",
                size: 12,
                color: "000000"  // Black color
            });
        });

        // Add "owed_by" section
        user.balance.owed_by.forEach((entry, index) => {
            annotations.push({
                pages: "",
                x: 100,
                y: 500 - (index * 20),  // Adjust Y position dynamically for "owed_by"
                text: `Owed by ${entry.from}: ${entry.amount} in ${entry.groupName}`,
                fontname: "Times New Roman",
                size: 12,
                color: "000000"  // Black color
            });
        });

        // JSON payload for the PDF.co API request
        const jsonPayload = JSON.stringify({
            name: path.basename(DestinationFile),
            url: SourceFileUrl,
            password: Password,
            annotations: annotations
        });

        // Prepare the request options
        const reqOptions = {
            host: "api.pdf.co",
            method: "POST",
            path: encodeURI("/v1/pdf/edit/add"),
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(jsonPayload, 'utf8')
            }
        };

        // Send request to PDF.co API
        const postRequest = https.request(reqOptions, (response) => {
            response.on("data", (d) => {
                // Parse JSON response
                const data = JSON.parse(d);

                if (data.error === false) {
                    // Download the output file
                    const file = fs.createWriteStream(DestinationFile);
                    https.get(data.url, (response2) => {
                        response2.pipe(file).on("close", () => {
                            res.status(200).json({ msg: `Generated PDF saved to '${DestinationFile}'`, downloadUrl: data.url });
                        });
                    });
                } else {
                    // Service reported an error
                    res.status(500).json({ msg: data.message });
                }
            });
        }).on("error", (e) => {
            // Request error
            res.status(500).json({ msg: "Unable to generate PDF", error: e.message });
        });

        // Write the request data
        postRequest.write(jsonPayload);
        postRequest.end();

    } catch (error) {
        res.status(500).json({ msg: "Unable to generate PDF", error: error.message });
    }
});



// Add group balance to PDF as annotations

router.get('/group/:groupName/download/pdf', jwtchecker, async function(req, res) {
    try {
        const { groupName } = req.params;
        const myusername = req.myusername;

        // Fetch the group information from groupdb, including participants and expenses
        const group = await groupdb.findOne({ name: groupName }, 'expenses participants');

        if (!group || !group.expenses) {
            return res.status(404).json({ msg: "Group or expenses not found" });
        }

        // Check if the logged-in user is part of the group's participants
        if (!group.participants.includes(myusername)) {
            return res.status(403).json({ msg: "You are not part of this group" });
        }

        // Prepare dynamic annotations based on the group's expenses
        const annotations = [];

        // Add each group's expense as annotations
        group.expenses.forEach((expense, index) => {
            annotations.push({
                pages: "",  
                x: 100,     // X coordinate for annotation
                y: 700 - (index * 20),  // Adjust Y position dynamically
                text: `Paid by ${expense.paid_by}: ${expense.total_amount}, Split Method: ${expense.split_method}`,
                fontname: "Times New Roman",
                size: 12,
                color: "000000"  // Black color
            });

            // Add individual transactions within each expense
            expense.transactions.forEach((transaction, subIndex) => {
                annotations.push({
                    pages: "",
                    x: 100,
                    y: 650 - ((index * 20) + (subIndex * 15)),  // Adjust Y position for transactions
                    text: `User: ${transaction.user}, Amount: ${transaction.amount}`,
                    fontname: "Times New Roman",
                    size: 10,
                    color: "000000"  // Black color
                });
            });
        });

        // JSON payload for the PDF.co API request
        const jsonPayload = JSON.stringify({
            name: path.basename(DestinationFile),
            url: SourceFileUrl,
            password: Password,
            annotations: annotations
        });

        // Prepare the request options
        const reqOptions = {
            host: "api.pdf.co",
            method: "POST",
            path: encodeURI("/v1/pdf/edit/add"),
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(jsonPayload, 'utf8')
            }
        };

        // Send request to PDF.co API
        const postRequest = https.request(reqOptions, (response) => {
            response.on("data", (d) => {
                // Parse JSON response
                const data = JSON.parse(d);

                if (data.error === false) {
                    // Download the output file
                    const file = fs.createWriteStream(DestinationFile);
                    https.get(data.url, (response2) => {
                        response2.pipe(file).on("close", () => {
                            res.status(200).json({ msg: `Generated PDF saved to '${DestinationFile}'`, downloadUrl: data.url });
                        });
                    });
                } else {
                    // Service reported an error
                    res.status(500).json({ msg: data.message });
                }
            });
        }).on("error", (e) => {
            // Request error
            res.status(500).json({ msg: "Unable to generate PDF", error: e.message });
        });

        // Write the request data
        postRequest.write(jsonPayload);
        postRequest.end();

    } catch (error) {
        res.status(500).json({ msg: "Unable to generate PDF", error: error.message });
    }
});




router.get('/user', jwtchecker, async function(req, res) {   //Responds with the specific user's balance
    try {
        const myusername= req.myusername;

        // Fetch the user from userdb
        const user = await userdb.findOne({username: myusername}, 'balance');

        if (!user || !user.balance) {
            return res.status(404).json({msg: "No balance data found for the user"});
        }

        res.status(200).json(user.balance); // Return the user's balance field (owes and owed_by)
    } catch (error) {
        res.status(500).json({msg: "Unable to fetch user expenses", error: error.message});
    }
});


router.get('/group/:groupName', jwtchecker, async function(req, res) {     //Responds with the balance of the entire group
    try {
        const {groupName} = req.params;
        const myusername = req.myusername;

        // Fetch the group information from groupdb, including participants
        const group = await groupdb.findOne({name: groupName}, 'expenses participants');

        if (!group || !group.expenses) {
            return res.status(404).json({msg: "Group or expenses not found"});
        }

        // Check if the logged-in user is part of the group's participants
        if (!group.participants.includes(myusername)) {
            return res.status(403).json({msg: "You are not part of this group"});
        }

        // If the user is part of the group, return the group's expenses
        res.status(200).json(group.expenses);
    } catch (error) {
        res.status(500).json({ msg: "Unable to fetch group expenses", error: error.message });
    }
});





module.exports= router;
