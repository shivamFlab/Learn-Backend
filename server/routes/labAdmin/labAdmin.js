import { Router } from "express";
import { labAdminSignup,labAdminLogin } from "../../controllers/labAdmin/labAdmin.js";
import { verifyToken } from "../../middleware/verifyToken.js";

const router = Router();

router.post("/signup", labAdminSignup);
router.post("/login", labAdminLogin);

export const labAdminRouter = router;
