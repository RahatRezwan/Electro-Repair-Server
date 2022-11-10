const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

/* verify access token */
const verifyJWT = (req, res, next) => {
   const authHeader = req.headers.authorization;
   if (!authHeader) {
      return res.status(401).send({ Message: "Unauthorized Access" });
   }
   const token = authHeader.split(" ")[1];
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
         return res.status(403).send({ Message: "Unauthorized Access" });
      }
      req.decoded = decoded;
      next();
   });
};

const run = async () => {
   try {
      const serviceCollection = client.db("Electro_Repair").collection("services");

      const reviewCollection = client.db("Electro_Repair").collection("reviews");

      const blogCollection = client.db("Electro_Repair").collection("blogs");

      /* jwt token */
      app.post("/jwt", (req, res) => {
         const user = req.body;
         const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10h" });
         res.send({ token });
      });

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
         const limit = parseInt(req.query.limit);
         let query = {};
         if (serviceId) {
            query = { serviceId: serviceId };
         }
         const options = {
            sort: { date: -1 },
         };
         const cursor = reviewCollection.find(query, options);
         const reviews = await cursor.limit(limit).toArray();
         res.send(reviews);
      });

      /* get method for reviews by email */
      app.get("/reviews-by-email", verifyJWT, async (req, res) => {
         const email = req.query.email;
         const decoded = req.decoded;
         if (decoded.email !== email) {
            return res.status(403).send({ message: "Unauthorized access" });
         }
         let query = {};

         if (email) {
            query = { userEmail: email };
         }
         const options = {
            sort: { date: -1 },
         };
         const cursor = reviewCollection.find(query, options);
         const reviews = await cursor.toArray();
         res.send(reviews);
      });

      /* route to update a single review by id */
      app.put("/reviews/:id", async (req, res) => {
         const id = req.params.id;
         const newComment = req.body;
         const query = { _id: ObjectId(id) };
         const updateDoc = {
            $set: {
               comment: newComment.editedComment,
            },
         };
         const result = await reviewCollection.updateOne(query, updateDoc);
         res.send(result);
      });

      /* Delete a review */
      app.delete("/reviews/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await reviewCollection.deleteOne(query);
         res.send(result);
      });

      /* post route for blog */
      app.post("/blogs", async (req, res) => {
         const blog = req.body;
         const result = await blogCollection.insertOne(blog);
         res.send(result);
      });

      /* Get route for blog */
      app.get("/blogs", async (req, res) => {
         const size = parseInt(req.query.size);
         const query = {};
         const options = {
            sort: { date: -1 },
         };
         const cursor = blogCollection.find(query, options);
         const blogs = await cursor.limit(size).toArray();
         res.send(blogs);
      });

      /* Route a get a single blog */
      app.get("/blogs/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const blog = await blogCollection.findOne(query);
         res.send(blog);
      });
   } finally {
   }
};
run().catch((error) => console.log(error));

app.listen(port, () => {
   console.log(`Sever is running on port : ${port}`);
});
