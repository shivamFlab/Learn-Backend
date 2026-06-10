import { describe, expect, it } from "vitest";
import { request } from "../helpers.js";
import { labAdminModel } from "../../server/schema/labAdmin.js";
import { labModel } from "../../server/schema/lab.js";
import { labUsersModel } from "../../server/schema/labUsers.js";
import { PatientModel } from "../../server/schema/patient.js";

describe("GET /getLabAdminLabs aggregation", () => {
  it("returns an empty data array when there is nothing", async () => {
    const res = await request.get("/getLabAdminLabs");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it("nests labs, their users and patients under each admin", async () => {
    const admin = await labAdminModel.create({
      name: "Admin",
      contact: "1",
      username: "aggadmin",
      password: "p",
      isActive: true,
    });
    const lab = await labModel.create({
      labAdmin: admin._id,
      labName: "Agg Lab",
      contact: "2",
      email: "agg@lab.com",
    });
    await labUsersModel.create({
      labId: lab._id,
      name: "Tech",
      username: "aggtech",
      password: "p",
    });
    await PatientModel.create({ labId: lab._id, patientName: "Agg Patient" });

    const res = await request.get("/getLabAdminLabs");
    expect(res.status).toBe(200);

    const adminNode = res.body.data.find((a) => a.name === "Admin");
    expect(adminNode).toBeDefined();
    expect(adminNode.adminLabs).toHaveLength(1);

    const labNode = adminNode.adminLabs[0];
    expect(labNode.labName).toBe("Agg Lab");
    expect(labNode.labUsers).toHaveLength(1);
    expect(labNode.labUsers[0].name).toBe("Tech");
    expect(labNode.labPatients).toHaveLength(1);
    expect(labNode.labPatients[0].patientName).toBe("Agg Patient");

    // projection drops the password from nested lab users
    expect(labNode.labUsers[0].password).toBeUndefined();
  });
});
