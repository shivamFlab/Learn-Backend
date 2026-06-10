import jwt from "jsonwebtoken";

function signToken(User) {
  return jwt.sign(
    {
      labAdminId: User?.labAdmin,
      labId: User?._id,
      role: User?.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "6h" }
  );
}

export { signToken };
