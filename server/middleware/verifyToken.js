import jwt from "jsonwebtoken";

function verifyToken(req, res, next) {
  console.log("Token verification call come");
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(402).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log({ decoded });
    req.labAdminId = decoded?.labAdminId;
    req.labId = decoded?.labId;
    // req.role = decoded?.role;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

export { verifyToken };
