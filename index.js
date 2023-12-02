const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleaware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7s5ai.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("alphaTeam");

    //database collections
    const usersCollection = database.collection("users");

    //get all users

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const user = await cursor.toArray();
      res.send(user);
      console.log(user);
    });

    //get single users

    //GET API- filtered users
    app.get("/filteredUsers", async (req, res) => {
      const { search, domain, gender, availability } = req.query;

      const filter = {};
      if (search) {
        filter.$or = [{ name: { $regex: search, $options: "i" } }];
      }
      if (domain) {
        filter.domain = domain;
      }
      if (gender) {
        filter.gender = gender;
      }
      if (availability) {
        filter.availability = availability;
      }

      const users = await usersCollection.find(filter).toArray();
      res.send(users);
    });

    //POST API-

    //Delete API -
  } finally {
    //await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" server is running");
});

app.listen(port, () => {
  // console.log("server running at port", port);
});
