import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { userdb } from './mongo.js'; // make sure your schema is correct

const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// MongoDB Atlas connection
const mongoURI = "mongodb+srv://Aditya4743_db_user:hxn39ZOBfMfQkerJ@cluster0.pj6ytzh.mongodb.net/userdb?retryWrites=true&w=majority";

const startServer = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Atlas Connected Successfully");

    // Routes
    app.get('/', async (req, res) => {
      try {
        const user2 = new userdb({
          name: "Aditya",
          email: "aditya2@example.com",
          password: "password13"
        });
        await user2.save();
        res.send('Dummy user added!');
      } catch (err) {
        res.status(500).send("Error adding dummy users");
      }
    });

    app.post('/signup', async (req, res) => {
      const { name, email, password } = req.body;
      if (!name || !email || !password) return res.status(400).send("All fields are required");
      try {
        const newUser = new userdb({ name, email, password });
        await newUser.save();
        res.status(201).send("User registered successfully");
      } catch (err) {
        if (err.code === 11000) res.status(400).send("Email already exists");
        else res.status(500).send("Error registering user");
      }
    });

    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: "All fields are required" });
      try {
        const user = await userdb.findOne({ email, password });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });
        res.status(200).json({ message: "Login successful" });
      } catch (err) {
        res.status(500).json({ message: "Error logging in user" });
      }
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

startServer();
