import { Router } from "express";
import { createLab,updateLab } from "../../controllers/lab/lab.js";
import { verifyToken } from "../../middleware/verifyToken.js";

const router = Router();

router.post("/create", verifyToken, createLab);
router.post("/update", verifyToken, updateLab);


export const labRouter = router;
