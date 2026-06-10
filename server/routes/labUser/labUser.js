import { Router } from "express";
import { createLabUser } from "../../controllers/lab/labUsers.js";
import { verifyToken } from "../../middleware/verifyToken.js";

const router = Router();

router.post("/createLabUser", verifyToken, createLabUser);

export const labUserRouter = router;
