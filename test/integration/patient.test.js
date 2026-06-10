import { beforeEach, describe, expect, it } from "vitest";
import { authHeader, newId, request } from "../helpers.js";
import { PatientModel } from "../../server/schema/patient.js";

let labId;
let auth;

beforeEach(() => {
  labId = newId();
  auth = authHeader({ labId });
});

describe("patient CRUD (auth + lab-scoped)", () => {
  it("blocks every endpoint without a token (402)", async () => {
    expect((await request.post("/patient").send({})).status).toBe(402);
    expect((await request.get("/patient")).status).toBe(402);
    expect((await request.put("/patient").send({})).status).toBe(402);
    expect((await request.delete("/patient").send({})).status).toBe(402);
  });

  it("creates a patient scoped to the token's lab", async () => {
    const res = await request
      .post("/patient")
      .set("Authorization", auth)
      .send({ patientName: "John", gender: "male" });

    expect(res.status).toBe(200);
    expect(res.body.data.patientName).toBe("John");
    expect(res.body.data.labId).toBe(labId);
  });

  it("rejects creating a patient with no name (402)", async () => {
    const res = await request
      .post("/patient")
      .set("Authorization", auth)
      .send({ gender: "male" });
    expect(res.status).toBe(402);
    expect(res.body.success).toBe(false);
  });

  it("defaults gender to male when omitted", async () => {
    const res = await request
      .post("/patient")
      .set("Authorization", auth)
      .send({ patientName: "NoGender" });
    expect(res.body.data.gender).toBe("male");
  });

  it("only lists patients belonging to the caller's lab", async () => {
    await PatientModel.create({ labId, patientName: "Mine" });
    await PatientModel.create({ labId: newId(), patientName: "Theirs" });

    const res = await request.get("/patient").set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].patientName).toBe("Mine");
  });

  it("updates a patient in the caller's lab", async () => {
    const p = await PatientModel.create({ labId, patientName: "Before" });
    const res = await request
      .put("/patient")
      .set("Authorization", auth)
      .send({ id: p._id.toString(), patientName: "After", gender: "female" });

    expect(res.status).toBe(200);
    expect(res.body.data.patientName).toBe("After");
    expect(res.body.data.gender).toBe("female");
  });

  it("cannot update a patient from another lab (404)", async () => {
    const p = await PatientModel.create({ labId: newId(), patientName: "Other" });
    const res = await request
      .put("/patient")
      .set("Authorization", auth)
      .send({ id: p._id.toString(), patientName: "Hacked" });
    expect(res.status).toBe(404);
  });

  it("rejects an invalid enum on update (500)", async () => {
    const p = await PatientModel.create({ labId, patientName: "EnumTest" });
    const res = await request
      .put("/patient")
      .set("Authorization", auth)
      .send({ id: p._id.toString(), gender: "alien" });
    expect(res.status).toBe(500);
  });

  it("deletes a patient in the caller's lab", async () => {
    const p = await PatientModel.create({ labId, patientName: "DeleteMe" });
    const res = await request
      .delete("/patient")
      .set("Authorization", auth)
      .send({ id: p._id.toString() });

    expect(res.status).toBe(200);
    expect(await PatientModel.findById(p._id)).toBeNull();
  });

  it("returns 404 deleting a non-existent / other-lab patient", async () => {
    const res = await request
      .delete("/patient")
      .set("Authorization", auth)
      .send({ id: newId() });
    expect(res.status).toBe(404);
  });
});
