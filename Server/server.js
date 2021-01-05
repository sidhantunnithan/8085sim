const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { json } = require("body-parser");
const { getAssembledInstructions } = require(__dirname + "/assembler.js");

const app = express();
const jsonParser = bodyParser.json();
const port = 5050;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Client/build/index.html"));
});

app.post("/api", jsonParser, (req, res) => {
    if (req.body.hasOwnProperty("code")) {
        getAssembledInstructions(req.body.code.split(" ")).then(
            (assembledInstructions) => {
                res.json({
                    code: 0,
                    payload: assembledInstructions,
                });
            }
        );
    } else {
        res.json({
            code: 1,
            payload: "Invalid Parameters",
        });
    }
});

app.listen(port, function () {
    console.log("server started");
});
