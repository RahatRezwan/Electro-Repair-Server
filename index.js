const { MongoClient, ServerApiVersion } = require("mongodb");
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

/* connect mongodb */

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.9tctcbt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
   const collection = client.db("test").collection("devices");
   // perform actions on the collection object
   client.close();
});

app.listen(port, () => {
   console.log(`Sever is running on port : ${port}`);
});
