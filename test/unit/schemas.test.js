import { describe, expect, it } from "vitest";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { labAdminModel } from "../../server/schema/labAdmin.js";
import { labModel } from "../../server/schema/lab.js";
import { labUsersModel } from "../../server/schema/labUsers.js";
import { PatientModel } from "../../server/schema/patient.js";
import { TestModel } from "../../server/schema/test.js";
import { BillModel } from "../../server/schema/bill.js";

const oid = () => new mongoose.Types.ObjectId();

describe("labAdmin schema", () => {
  it("requires name, contact, username and password", async () => {
    const err = new labAdminModel({}).validateSync();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.contact).toBeDefined();
    expect(err.errors.username).toBeDefined();
    expect(err.errors.password).toBeDefined();
    // email is optional
    expect(err.errors.email).toBeUndefined();
  });

  it("defaults role to 'labAdmin'", () => {
    const doc = new labAdminModel({
      name: "A",
      contact: "1",
      username: "u",
      password: "p",
    });
    expect(doc.role).toBe("labAdmin");
  });

  it("hashes the password on save via the pre-save hook", async () => {
    const doc = await labAdminModel.create({
      name: "A",
      contact: "1",
      username: "hashme",
      password: "plain-text",
    });
    expect(doc.password).not.toBe("plain-text");
    expect(await bcrypt.compare("plain-text", doc.password)).toBe(true);
  });

  it("enforces unique username", async () => {
    await labAdminModel.create({
      name: "A",
      contact: "1",
      username: "dupe",
      password: "p",
    });
    await expect(
      labAdminModel.create({
        name: "B",
        contact: "2",
        username: "dupe",
        password: "p",
      })
    ).rejects.toMatchObject({ code: 11000 });
  });
});

describe("lab schema", () => {
  it("requires labAdmin, labName and contact", () => {
    const err = new labModel({}).validateSync();
    expect(err.errors.labAdmin).toBeDefined();
    expect(err.errors.labName).toBeDefined();
    expect(err.errors.contact).toBeDefined();
  });

  it("accepts a valid lab", () => {
    const err = new labModel({
      labAdmin: oid(),
      labName: "Lab",
      contact: "999",
    }).validateSync();
    expect(err).toBeUndefined();
  });
});

describe("labUser schema", () => {
  it("requires labId, name, username and password", () => {
    const err = new labUsersModel({}).validateSync();
    expect(err.errors.labId).toBeDefined();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.username).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it("defaults role to 'labUser' and hashes password on save", async () => {
    const doc = await labUsersModel.create({
      labId: oid(),
      name: "U",
      username: "labuser1",
      password: "secret",
    });
    expect(doc.role).toBe("labUser");
    expect(doc.password).not.toBe("secret");
    expect(await bcrypt.compare("secret", doc.password)).toBe(true);
  });
});

describe("patient schema", () => {
  it("requires labId and patientName", () => {
    const err = new PatientModel({}).validateSync();
    expect(err.errors.labId).toBeDefined();
    expect(err.errors.patientName).toBeDefined();
  });

  it("defaults gender to 'male'", () => {
    const doc = new PatientModel({ labId: oid(), patientName: "P" });
    expect(doc.gender).toBe("male");
  });

  it("rejects an out-of-enum gender", () => {
    const err = new PatientModel({
      labId: oid(),
      patientName: "P",
      gender: "unknown",
    }).validateSync();
    expect(err.errors.gender).toBeDefined();
  });
});

describe("test schema", () => {
  it("requires labId, name and price", () => {
    const err = new TestModel({}).validateSync();
    expect(err.errors.labId).toBeDefined();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.price).toBeDefined();
  });

  it("casts a numeric-string price to a number", () => {
    const doc = new TestModel({ labId: oid(), name: "CBC", price: "250" });
    expect(doc.price).toBe(250);
  });
});

describe("bill schema", () => {
  it("requires labId, patientId and amount", () => {
    const err = new BillModel({}).validateSync();
    expect(err.errors.labId).toBeDefined();
    expect(err.errors.patientId).toBeDefined();
    expect(err.errors.amount).toBeDefined();
  });

  it("defaults status to 'unpaid'", () => {
    const doc = new BillModel({ labId: oid(), patientId: oid(), amount: 100 });
    expect(doc.status).toBe("unpaid");
  });

  it("rejects a status outside the enum", () => {
    const err = new BillModel({
      labId: oid(),
      patientId: oid(),
      amount: 100,
      status: "refunded",
    }).validateSync();
    expect(err.errors.status).toBeDefined();
  });

  it("requires name and price on each nested test line", () => {
    const err = new BillModel({
      labId: oid(),
      patientId: oid(),
      amount: 100,
      tests: [{ name: "CBC" }],
    }).validateSync();
    expect(err.errors["tests.0.price"]).toBeDefined();
  });
});
