import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import {
  createBill,
  getBills,
  updateBill,
  deleteBill,
} from "../../controllers/lab/bill.js";

const router = Router();

router.post("/create", verifyToken, createBill);
router.get("/getAll", verifyToken, getBills);
router.put("/update", verifyToken, updateBill);
router.delete("/delete", verifyToken, deleteBill);

export const billRouter = router;
