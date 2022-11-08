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

const run = async () => {
   try {
      const serviceCollection = client.db("Electro_Repair").collection("services");

      app.post("/services", async (req, res) => {
         const service = req.body;
         const result = await serviceCollection.insertOne(service);
         res.send(result);
      });
   } finally {
   }
};
run().catch((error) => console.log(error));

app.listen(port, () => {
   console.log(`Sever is running on port : ${port}`);
});
