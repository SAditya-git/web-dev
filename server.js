import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { userdb } from './mongo.js';

const app = express();
const port = 5000;
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
const startServer = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/userdb");
        console.log("MongoDB connected");

        // Test route to add dummy users
        app.get('/', async (req, res) => {
            try {
                // const user1 = new userdb({
                //     name: "Aditya",
                //     email: "aditya@example.com",
                //     password: "password123"
                // });
                const user2 = new userdb({
                    name: "Aditya",
                    email: "aditya2@example.com",
                    password: "password13"
                });

                // await user1.save();
                await user2.save();

                res.send('Dummy users added!');
            } catch (err) {
                res.status(500).send("Error adding dummy users");
            }
        });

        // Signup route
        app.post('/signup', async (req, res) => {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).send("All fields are required");
            }

            try {
                const newUser = new userdb({ name, email, password });
                await newUser.save();
                res.status(201).send("User registered successfully");
            } catch (err) {
                if (err.code === 11000) {
                    res.status(400).send("Email already exists");
                } else {
                    res.status(500).send("Error registering user");
                }
            }
        });
        app.post('/login', async (req, res) => {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }
            try {
                const user = await userdb.findOne({ email: email, password: password });
                if (!user) {
                    // xtr.innerHTML = "Your Email or Password is incorrect";
                    return res.status(400).json({ message: "Invalid email or password" });
                }
                res.status(200).json({ message: "Login successful" });
                // xtr.innerHTML = "Login successful";
                // window.location.href = "hotel.html";
            } catch (err) {
                if (err.code === 11000) {
                    res.status(400).json({ message: "Email already exists" });
                } else {
                    res.status(500).json({ message: "Error registering user" });
                }
            }
        });

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });

    } catch (err) {
        console.error(err);
    }
};
startServer();
