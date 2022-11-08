const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();

app.get("/", (req, res) => {
   res.send("electro repair server is running");
});

app.listen(port, () => {
   console.log(`Sever is running on port : ${port}`);
});
