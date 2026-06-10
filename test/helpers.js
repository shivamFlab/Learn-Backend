import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import supertest from "supertest";
import { createApp } from "../appFactory.js";

export const app = createApp();
export const request = supertest(app);

// Mints a token shaped exactly like utils/signJWT.js produces, so the
// verifyToken middleware populates req.labAdminId / req.labId.
export function makeToken({
  labAdminId = new mongoose.Types.ObjectId().toString(),
  labId = new mongoose.Types.ObjectId().toString(),
  role = "labAdmin",
  expiresIn = "6h",
} = {}) {
  return jwt.sign({ labAdminId, labId, role }, process.env.JWT_SECRET, {
    expiresIn,
  });
}

export function authHeader(opts) {
  return `Bearer ${makeToken(opts)}`;
}

export const newId = () => new mongoose.Types.ObjectId().toString();
