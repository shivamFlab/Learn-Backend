import { beforeEach, describe, expect, it } from "vitest";
import { authHeader, newId, request } from "../helpers.js";
import { BillModel } from "../../server/schema/bill.js";

let labId;
let auth;

beforeEach(() => {
  labId = newId();
  auth = authHeader({ labId });
});

describe("bill CRUD", () => {
  it("requires auth on all endpoints (402)", async () => {
    expect((await request.post("/bill").send({})).status).toBe(402);
    expect((await request.get("/bill")).status).toBe(402);
    expect((await request.put("/bill").send({})).status).toBe(402);
    expect((await request.delete("/bill").send({})).status).toBe(402);
  });

  it("creates a bill with nested test lines, scoped to the lab", async () => {
    const patientId = newId();
    const res = await request
      .post("/bill")
      .set("Authorization", auth)
      .send({
        patientId,
        amount: 500,
        status: "paid",
        tests: [{ name: "CBC", price: 250 }, { name: "Lipid", price: 250 }],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.labId).toBe(labId);
    expect(res.body.data.patientId).toBe(patientId);
    expect(res.body.data.status).toBe("paid");
    expect(res.body.data.tests).toHaveLength(2);
  });

  it("defaults status to unpaid when omitted", async () => {
    const res = await request
      .post("/bill")
      .set("Authorization", auth)
      .send({ patientId: newId(), amount: 100 });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("unpaid");
  });

  it("rejects a missing patientId or amount (402)", async () => {
    expect(
      (
        await request
          .post("/bill")
          .set("Authorization", auth)
          .send({ amount: 100 })
      ).status
    ).toBe(402);
    expect(
      (
        await request
          .post("/bill")
          .set("Authorization", auth)
          .send({ patientId: newId() })
      ).status
    ).toBe(402);
  });

  it("rejects an amount of 0 (controller treats it as missing)", async () => {
    const res = await request
      .post("/bill")
      .set("Authorization", auth)
      .send({ patientId: newId(), amount: 0 });
    expect(res.status).toBe(402);
  });

  it("returns 500 for an invalid status enum on create", async () => {
    const res = await request
      .post("/bill")
      .set("Authorization", auth)
      .send({ patientId: newId(), amount: 100, status: "refunded" });
    expect(res.status).toBe(500);
  });

  it("lists only the caller lab's bills", async () => {
    await BillModel.create({ labId, patientId: newId(), amount: 1 });
    await BillModel.create({ labId: newId(), patientId: newId(), amount: 2 });
    const res = await request.get("/bill").set("Authorization", auth);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].amount).toBe(1);
  });

  it("updates a bill's status in the caller's lab", async () => {
    const b = await BillModel.create({ labId, patientId: newId(), amount: 100 });
    const res = await request
      .put("/bill")
      .set("Authorization", auth)
      .send({ id: b._id.toString(), status: "paid", amount: 150 });
    expect(res.body.data.status).toBe("paid");
    expect(res.body.data.amount).toBe(150);
  });

  it("cannot update another lab's bill (404)", async () => {
    const b = await BillModel.create({
      labId: newId(),
      patientId: newId(),
      amount: 1,
    });
    const res = await request
      .put("/bill")
      .set("Authorization", auth)
      .send({ id: b._id.toString(), status: "paid" });
    expect(res.status).toBe(404);
  });

  it("deletes a bill in the caller's lab", async () => {
    const b = await BillModel.create({ labId, patientId: newId(), amount: 1 });
    const res = await request
      .delete("/bill")
      .set("Authorization", auth)
      .send({ id: b._id.toString() });
    expect(res.status).toBe(200);
    expect(await BillModel.findById(b._id)).toBeNull();
  });

  it("returns 404 deleting a non-existent bill", async () => {
    const res = await request
      .delete("/bill")
      .set("Authorization", auth)
      .send({ id: newId() });
    expect(res.status).toBe(404);
  });
});
