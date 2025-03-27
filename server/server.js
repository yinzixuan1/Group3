import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer"; // Import multer
import chat from "./chat.js";
import User from "./models/User.js";
import fs from 'fs';


// Load .env variables
dotenv.config();

// Connect to MongoDB using Mongoose
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log(" MongoDB connected"))
.catch(err => console.error(" MongoDB connection error:", err));


// Load JSON file and insert into DB
const loadUsersFromJSON = async () => {
  const data = fs.readFileSync('./users.json', 'utf-8');
  const users = JSON.parse(data);

  for (const user of users) {
    // Optionally hash password before saving (bcrypt)
    const existing = await User.findOne({ username: user.username });
    if (!existing) {
      await User.create(user);
    }
  }

  console.log(" Users loaded from JSON");
};

if (process.env.NODE_ENV !== 'test') {
  loadUsersFromJSON();
}



// Initialize Express
const app = express();
app.use(cors());
app.use(express.json()); // Needed before routes


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const PORT = 5001;

let filePath;

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  res.status(200).json({ user });
});

app.post("/api/register", async (req, res) => {
  const { username, password, nickname } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = new User({ username, password, nickname });
    await newUser.save();

    res.status(200).json({ user: newUser });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/upload", upload.single("file"), async (req, res) => {
  // Use multer to handle file upload
  filePath = req.file.path; // The path where the file is temporarily saved
  res.send(filePath + " upload successfully.");
});

app.get("/chat", async (req, res) => {
  const resp = await chat(filePath, req.query.question); // Pass the file path to your main function
  res.send(resp.text);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


export default app;
