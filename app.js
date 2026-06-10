import { connectDB } from "./config/dbConnection.js";
import dotenv from "dotenv";
import { createApp } from "./appFactory.js";

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 3000;

try {
  await connectDB(process.env.MONGODB_URI);
  console.log("MongoDB connection successfull");
  app.listen(PORT, () => console.log(`Server starts at :${PORT}`));
} catch (err) {
  console.error("Failed to start:", err);
  process.exit(1);
}
