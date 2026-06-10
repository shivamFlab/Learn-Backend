import { beforeEach, describe, expect, it } from "vitest";
import bcrypt from "bcrypt";
import { authHeader, newId, request } from "../helpers.js";
import { labUsersModel } from "../../server/schema/labUsers.js";

let labId;
let auth;

beforeEach(() => {
  labId = newId();
  auth = authHeader({ labId });
});

describe("POST /labUser/createLabUser", () => {
  it("requires auth (402)", async () => {
    const res = await request
      .post("/labUser/createLabUser")
      .send({ name: "U", username: "u", password: "p" });
    expect(res.status).toBe(402);
  });

  it("creates a lab user scoped to the lab and hides the password", async () => {
    const res = await request
      .post("/labUser/createLabUser")
      .set("Authorization", auth)
      .send({ name: "Tech", username: "tech1", password: "secret" });

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe("tech1");
    expect(res.body.data.labId).toBe(labId);
    // password stripped from the response
    expect(res.body.data.password).toBeUndefined();

    // stored hashed, not plain
    const stored = await labUsersModel.findOne({ username: "tech1" });
    expect(stored.password).not.toBe("secret");
    expect(await bcrypt.compare("secret", stored.password)).toBe(true);
  });

  it("rejects missing required fields (402)", async () => {
    const res = await request
      .post("/labUser/createLabUser")
      .set("Authorization", auth)
      .send({ username: "noname", password: "p" });
    expect(res.status).toBe(402);
  });

  it("rejects a duplicate username (409)", async () => {
    await request
      .post("/labUser/createLabUser")
      .set("Authorization", auth)
      .send({ name: "A", username: "dupe", password: "p" });

    const res = await request
      .post("/labUser/createLabUser")
      .set("Authorization", authHeader({ labId: newId() }))
      .send({ name: "B", username: "dupe", password: "p" });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });
});
