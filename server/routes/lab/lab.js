import { Router } from "express";
import {
  createLab,
  updateLab,
  getMyLabs,
  switchLab,
} from "../../controllers/lab/lab.js";
import { verifyToken } from "../../middleware/verifyToken.js";

const router = Router();

router.post("/create", verifyToken, createLab);
router.post("/update", verifyToken, updateLab);
router.get("/myLabs", verifyToken, getMyLabs);
router.post("/switch", verifyToken, switchLab);

export const labRouter = router;
