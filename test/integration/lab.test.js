import { describe, expect, it } from "vitest";
import { authHeader, newId, request } from "../helpers.js";
import { labModel } from "../../server/schema/lab.js";

describe("lab routes (auth required)", () => {
  it("rejects unauthenticated create (402)", async () => {
    const res = await request
      .post("/lab/create")
      .send({ labName: "L", contact: "1" });
    expect(res.status).toBe(402);
  });

  it("POST /lab/create creates a lab owned by the token's labAdmin", async () => {
    const labAdminId = newId();
    const res = await request
      .post("/lab/create")
      .set("Authorization", authHeader({ labAdminId }))
      .send({ labName: "Branch Lab", contact: "12345", email: "b@lab.com" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.labAdmin).toBe(labAdminId);
    expect(res.body.data.labName).toBe("Branch Lab");
  });

  it("POST /lab/create rejects missing required fields (401)", async () => {
    const res = await request
      .post("/lab/create")
      .set("Authorization", authHeader())
      .send({ labName: "No Contact" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /lab/update updates the lab identified by the token's labId", async () => {
    const lab = await labModel.create({
      labAdmin: newId(),
      labName: "Old Name",
      contact: "000",
    });

    const res = await request
      .post("/lab/update")
      .set("Authorization", authHeader({ labId: lab._id.toString() }))
      .send({ labName: "New Name", contact: "111", email: "new@lab.com" });

    expect(res.status).toBe(200);
    expect(res.body.data.labName).toBe("New Name");
    expect(res.body.data.contact).toBe("111");

    const reloaded = await labModel.findById(lab._id);
    expect(reloaded.labName).toBe("New Name");
  });

  it("POST /lab/update returns null data when the lab does not exist", async () => {
    const res = await request
      .post("/lab/update")
      .set("Authorization", authHeader({ labId: newId() }))
      .send({ labName: "Nope" });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});
