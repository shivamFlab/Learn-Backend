import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import {
  createPatient,
  getPatients,
  updatePatient,
  deletePatient,
} from "../../controllers/lab/patient.js";

const router = Router();

router.post("/", verifyToken, createPatient);
router.get("/", verifyToken, getPatients);
router.put("/", verifyToken, updatePatient);
router.delete("/", verifyToken, deletePatient);

export const patientRouter = router;
