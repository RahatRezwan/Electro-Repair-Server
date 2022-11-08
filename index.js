const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
   res.send("electro repair server is running");
});

app.listen(port, () => {
   console.log(`Sever is running on port : ${port}`);
});
