const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000; // Use PORT from .env or default to 3000

// MongoDB connection URI from environment variable
const uri = process.env.MONGODB_URI;

// Check if the MongoDB URI is defined
if (!uri) {
  console.error('MongoDB URI is not defined. Please set the MONGODB_URI environment variable.');
  process.exit(1); // Exit the application if the URI is not defined
}

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
  try {
    const db = client.db('myusers'); // Replace with your database name
    const data = await db.collection('students').find({}).toArray(); // Fetch all documents from the 'students' collection

    if (data.length === 0) {
      return res.status(404).send('No data found');
    }

    res.status(200).json(data); // Send data as JSON
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Add a new student to the 'students' collection
app.post('/add-student', async (req, res) => {
  const { firstname, middlename, lastname, birthdate, sex } = req.body;

  if (!firstname || !lastname || !birthdate || !sex) {
    return res.status(400).send('First name, last name, birthdate, and sex are required');
  }

  try {
    const db = client.db('myusers');
    const newStudent = {
      firstname,
      middlename: middlename || null,
      lastname,
      birthdate,
      sex,
    };

    await db.collection('students').insertOne(newStudent); // Insert into 'students' collection
    res.status(201).send('New student added successfully');
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).send('Error adding student');
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
    console.error('Error connecting to MongoDB:', error);
  }
}

run().catch(console.dir);
