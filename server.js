const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

// MongoDB connection URI
const uri = "mongodb+srv://angelesedgardo17:dNjeAKovMY0psOmU@depedinfostorage.mddyf.mongodb.net/?retryWrites=true&w=majority&appName=depedinfostorage";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Fetch data from a collection
app.get('/fetch-data', async (req, res) => {
  const { collectionName } = req.query; // Get collection name from query parameters

  if (!collectionName) {
    return res.status(400).send('Collection name is required');
  }

  try {
    const db = client.db('myusers'); // Replace with your database name
    const data = await db.collection(collectionName).find({}).toArray(); // Fetch all documents

    if (data.length === 0) {
      return res.status(404).send('No data found');
    }

    res.status(200).json(data); // Send data as JSON
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Add a new field to a collection
app.post('/add-field', async (req, res) => {
  const { collectionName, fieldName, fieldValue } = req.body;

  try {
    const db = client.db('myusers'); // Replace with your database name
    const result = await db.collection(collectionName).updateMany(
      {}, // Match all documents
      { $set: { [fieldName]: fieldValue } }
    );

    if (result.modifiedCount === 0) {
      // If no documents were modified, insert a new document
      await db.collection(collectionName).insertOne({
        [fieldName]: fieldValue,
      });
      res.status(200).send(`No documents found. Added new document with field ${fieldName}.`);
    } else {
      res.status(200).send(`Added field ${fieldName} to ${result.modifiedCount} documents.`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding field');
  }
});

// Connect to MongoDB and start the server
async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    // Start the server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);
