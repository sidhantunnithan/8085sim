const express = require("express");
const path = require("path");

const app = express();
const port = 5050;

app.use(express.static(path.join(__dirname, "../Client/build")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Client/build/index.html"));
});

app.listen(port, function () {
    console.log("Server Started on port " + port);
});
