const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

      const reviewCollection = client.db("Electro_Repair").collection("reviews");

      /* post route for service */
      app.post("/services", async (req, res) => {
         const service = req.body;
         const result = await serviceCollection.insertOne(service);
         res.send(result);
      });

      /* service api get route */
      app.get("/services", async (req, res) => {
         const size = parseInt(req.query.size);
         const currentPage = parseInt(req.query.currentPage);
         const query = {};
         const options = {
            sort: { date: -1 },
         };
         const cursor = serviceCollection.find(query, options);
         const services = await cursor
            .skip(currentPage * size)
            .limit(size)
            .toArray();
         const count = await serviceCollection.countDocuments();
         res.send({ count, services });
      });

      /* get a single service */
      app.get("/services/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const service = await serviceCollection.findOne(query);
         res.send(service);
      });

      /* Post route for comment or review */
      app.post("/reviews", async (req, res) => {
         const review = req.body;
         const result = await reviewCollection.insertOne(review);
         res.send(result);
      });

      /* get method for reviews */
      app.get("/reviews", async (req, res) => {
         const serviceId = req.query.serviceId;
         let query = {};
         if (serviceId) {
            query = { serviceId: serviceId };
         }
         const options = {
            sort: { date: -1 },
         };
         const cursor = reviewCollection.find(query, options);
         const reviews = await cursor.toArray();
         res.send(reviews);
      });
   } finally {
   }
};
run().catch((error) => console.log(error));

app.listen(port, () => {
   console.log(`Sever is running on port : ${port}`);
});
