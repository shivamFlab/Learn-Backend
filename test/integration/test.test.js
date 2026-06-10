import { beforeEach, describe, expect, it } from "vitest";
import { authHeader, newId, request } from "../helpers.js";
import { TestModel } from "../../server/schema/test.js";

let labId;
let auth;

beforeEach(() => {
  labId = newId();
  auth = authHeader({ labId });
});

describe("test (lab test catalog) CRUD", () => {
  it("requires auth on all endpoints (402)", async () => {
    expect((await request.post("/test").send({})).status).toBe(402);
    expect((await request.get("/test")).status).toBe(402);
    expect((await request.put("/test").send({})).status).toBe(402);
    expect((await request.delete("/test").send({})).status).toBe(402);
  });

  it("creates a test scoped to the lab", async () => {
    const res = await request
      .post("/test")
      .set("Authorization", auth)
      .send({ name: "CBC", price: 250 });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("CBC");
    expect(res.body.data.price).toBe(250);
    expect(res.body.data.labId).toBe(labId);
  });

  it("allows a price of 0 (checks for undefined, not falsiness)", async () => {
    const res = await request
      .post("/test")
      .set("Authorization", auth)
      .send({ name: "Free Test", price: 0 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(0);
  });

  it("rejects missing name or price (402)", async () => {
    expect(
      (
        await request
          .post("/test")
          .set("Authorization", auth)
          .send({ price: 100 })
      ).status
    ).toBe(402);
    expect(
      (
        await request
          .post("/test")
          .set("Authorization", auth)
          .send({ name: "NoPrice" })
      ).status
    ).toBe(402);
  });

  it("lists only the caller lab's tests", async () => {
    await TestModel.create({ labId, name: "Mine", price: 1 });
    await TestModel.create({ labId: newId(), name: "Theirs", price: 2 });
    const res = await request.get("/test").set("Authorization", auth);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("Mine");
  });

  it("updates a test in the caller's lab", async () => {
    const t = await TestModel.create({ labId, name: "Old", price: 10 });
    const res = await request
      .put("/test")
      .set("Authorization", auth)
      .send({ id: t._id.toString(), name: "New", price: 20 });
    expect(res.body.data.name).toBe("New");
    expect(res.body.data.price).toBe(20);
  });

  it("cannot update another lab's test (404)", async () => {
    const t = await TestModel.create({ labId: newId(), name: "X", price: 1 });
    const res = await request
      .put("/test")
      .set("Authorization", auth)
      .send({ id: t._id.toString(), price: 999 });
    expect(res.status).toBe(404);
  });

  it("deletes a test in the caller's lab", async () => {
    const t = await TestModel.create({ labId, name: "Del", price: 5 });
    const res = await request
      .delete("/test")
      .set("Authorization", auth)
      .send({ id: t._id.toString() });
    expect(res.status).toBe(200);
    expect(await TestModel.findById(t._id)).toBeNull();
  });
});
