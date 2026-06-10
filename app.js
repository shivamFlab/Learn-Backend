import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/dbConnection.js";
import { labAdminRouter } from "./server/routes/labAdmin/labAdmin.js";
import { labRouter } from "./server/routes/lab/lab.js";
import { getLabAdminLabs } from "./utils/check/getLabAdminLabs.js";
import { labUserRouter } from "./server/routes/labUser/labUser.js";
import { patientRouter } from "./server/routes/patient/patient.js";
import { testRouter } from "./server/routes/test/test.js";
import { billRouter } from "./server/routes/bill/bill.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // we are allowing for all, anyone can hit our
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/getLabAdminLabs", getLabAdminLabs);
app.use("/labadmin", labAdminRouter);
app.use("/lab", labRouter);
app.use("/labUser", labUserRouter);
app.use("/patient", patientRouter);
app.use("/test", testRouter);
app.use("/bill", billRouter);

try {
  await connectDB(process.env.MONGODB_URI);
  console.log("MongoDB connection successfull");
  app.listen(PORT, () => console.log(`Server starts at :${PORT}`));
} catch (err) {
  console.error("Failed to start:", err);
  process.exit(1);
}
