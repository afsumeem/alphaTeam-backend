const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleWare
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

    //Single user

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    });

    //POST API-
    app.post("/users", async (req, res) => {
      const user = await usersCollection.insertOne(req.body);
      res.json(user);
    });

    //get all users

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const user = await cursor.toArray();
      res.send(user);
      // console.log(user);
    });

    //GET API- filtered users
    app.get("/filteredUsers", async (req, res) => {
      const { search, gender, domain, available } = req.query;

      const filter = {};
      if (search) {
        filter.$or = [
          { first_name: { $regex: search, $options: "i" } },
          { last_name: { $regex: search, $options: "i" } },
        ];
      }
      if (domain) {
        filter.domain = domain;
      }
      if (gender) {
        filter.gender = gender;
      }
      if (available !== undefined) {
        filter.available = available === "true";
      }

      const users = await usersCollection.find(filter).toArray();
      res.send(users);
    });

    //update user
    app.put("/users/:id", async (req, res) => {
      const userId = req.params.id;
      const updatedUserData = req.body;

      try {
        const updateUser = await usersCollection.updateOne(
          { _id: ObjectId(userId) },
          { $set: updatedUserData }
        );

        if (updateUser.modifiedCount > 0) {
          res.json({ message: "User updated successfully" });
        } else {
          res.status(404).json({ error: "User not found" });
        }
      } catch (error) {
        // console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //Delete API -
    app.delete("/users/:id", async (req, res) => {
      const deletedUser = await usersCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.json(deletedUser);
    });

    //
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
