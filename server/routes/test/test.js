import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import {
  createTest,
  getTests,
  updateTest,
  deleteTest,
} from "../../controllers/lab/test.js";

const router = Router();

router.post("/", verifyToken, createTest);
router.get("/", verifyToken, getTests);
router.put("/", verifyToken, updateTest);
router.delete("/", verifyToken, deleteTest);

export const testRouter = router;
