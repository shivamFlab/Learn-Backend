import express from 'express'
import { connectDB } from './config/dbConnection.js';
import dotenv from 'dotenv'

const app = express();
dotenv.config();


const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

try {
  await connectDB(process.env.MONGODB_URI);
  console.log("MongoDB connection successfull");
  app.listen(PORT, () => console.log(`Server starts at :${PORT}`));
} catch (err) {
  console.error("Failed to start:", err);
  process.exit(1);
}
