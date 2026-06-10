import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { request } from "../helpers.js";
import { labAdminModel } from "../../server/schema/labAdmin.js";
import { labModel } from "../../server/schema/lab.js";

const validSignup = {
  name: "Dr Admin",
  contact: "9999999999",
  email: "admin@lab.com",
  username: "dradmin",
  password: "supersecret",
  labName: "Central Lab",
};

describe("POST /labadmin/signup", () => {
  it("creates a labAdmin + default lab and returns a token", async () => {
    const res = await request.post("/labadmin/signup").send(validSignup);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    // password must never be returned
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.username).toBe("dradmin");

    // a default lab was created for the new admin
    const admin = await labAdminModel.findOne({ username: "dradmin" });
    const lab = await labModel.findOne({ labAdmin: admin._id });
    expect(lab).not.toBeNull();
    expect(lab.labName).toBe("Central Lab");

    // token carries that lab's id
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.labId).toBe(lab._id.toString());
  });

  it("rejects when a required field is missing (401)", async () => {
    const { labName, ...incomplete } = validSignup;
    const res = await request.post("/labadmin/signup").send(incomplete);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects a duplicate username (409)", async () => {
    await request.post("/labadmin/signup").send(validSignup);
    const res = await request
      .post("/labadmin/signup")
      .send({ ...validSignup, contact: "8888888888" });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("stores the password hashed, not in plain text", async () => {
    await request.post("/labadmin/signup").send(validSignup);
    const admin = await labAdminModel.findOne({ username: "dradmin" });
    expect(admin.password).not.toBe("supersecret");
  });
});

describe("POST /labadmin/login", () => {
  async function seedAdmin() {
    await request.post("/labadmin/signup").send(validSignup);
  }

  it("logs in with correct credentials and returns a token", async () => {
    await seedAdmin();
    const res = await request
      .post("/labadmin/login")
      .send({ username: "dradmin", password: "supersecret" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.data.password).toBeUndefined();
  });

  it("rejects a wrong password (401)", async () => {
    await seedAdmin();
    const res = await request
      .post("/labadmin/login")
      .send({ username: "dradmin", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("rejects an unknown username (401)", async () => {
    const res = await request
      .post("/labadmin/login")
      .send({ username: "ghost", password: "whatever" });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/does not exist/i);
  });

  it("rejects when fields are missing (401)", async () => {
    const res = await request.post("/labadmin/login").send({ username: "x" });
    expect(res.status).toBe(401);
  });
});
