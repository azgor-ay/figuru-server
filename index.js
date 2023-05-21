const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();
// middle ware
app.use(cors());
app.use(express.json());
console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@figuru-clustor.zyzgjkc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db("FiguruDatabase").collection("ActionFigures");
    const categoryCollection = client.db("categoryDB").collection("subCategories");
    const galleryPhotosCollection = client.db("photoGallery").collection("photos");

    app.get("/actionFigures", async (req, res) => {
      let query = {};
      if (req.query.subCategory) {
        query = { subCategory: req.query.subCategory };
      } else if (req.query.id) {
        query = { _id: new ObjectId(req.query.id) };
      } else if (req.query.email) {
        query = { email: req.query.email };
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/allToys", async (req, res) => {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);
      const skip = page * limit;
      const result = await toysCollection
        .find()
        .skip(skip)
        .limit(limit)
        .toArray();

      res.send(result);
    });

    app.get("/totalActionFigures", async (req, res) => {
      const result = await toysCollection.estimatedDocumentCount();
      res.send({ totalToys: result });
    });

    app.get("/categories", async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result);
    });

    app.get('/galleryPhotos', async (req, res) =>{
      const result = await galleryPhotosCollection.find().toArray();
      res.send(result)
    })
    app.post("/actionFigures", async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    app.put("/actionFigures/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const { image, name, price, rating, reviews, stock } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          image,
          name,
          price,
          rating,
          reviews,
          stock,
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/actionFigures/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });
    app.delete("/actionFigures", async (req, res) => {
      const query = { email: { $eq: req.query.email } };
      const result = await toysCollection.deleteMany(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Figuru Server Site is Online Now");
});

app.listen(port, () => {
  console.log("Server is running from " + port + " port");
});
