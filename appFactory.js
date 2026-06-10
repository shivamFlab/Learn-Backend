import express from "express";
import cors from "cors";
import { labAdminRouter } from "./server/routes/labAdmin/labAdmin.js";
import { labRouter } from "./server/routes/lab/lab.js";
import { getLabAdminLabs } from "./utils/check/getLabAdminLabs.js";
import { labUserRouter } from "./server/routes/labUser/labUser.js";
import { patientRouter } from "./server/routes/patient/patient.js";
import { testRouter } from "./server/routes/test/test.js";
import { billRouter } from "./server/routes/bill/bill.js";
import { verifyToken } from "./server/middleware/verifyToken.js";

export function createApp() {
  const app = express();

  app.use(cors()); 
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

  return app;
}
