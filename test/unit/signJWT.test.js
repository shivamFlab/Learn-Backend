import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { signToken } from "../../utils/signJWT.js";

describe("signToken", () => {
  it("encodes labAdmin, lab id and role into the token", () => {
    const user = { labAdmin: "admin1", _id: "lab1", role: "labAdmin" };
    const token = signToken(user);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.labAdminId).toBe("admin1");
    expect(decoded.labId).toBe("lab1");
    expect(decoded.role).toBe("labAdmin");
  });

  it("sets a 6h expiry", () => {
    const decoded = jwt.verify(
      signToken({ _id: "lab1" }),
      process.env.JWT_SECRET
    );
    // exp - iat should be 6 hours in seconds.
    expect(decoded.exp - decoded.iat).toBe(6 * 60 * 60);
  });

  it("tolerates a missing/undefined user (optional chaining)", () => {
    const token = signToken(undefined);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.labAdminId).toBeUndefined();
    expect(decoded.labId).toBeUndefined();
  });

  it("produces a token rejected by a different secret", () => {
    const token = signToken({ _id: "lab1" });
    expect(() => jwt.verify(token, "wrong-secret")).toThrow();
  });
});
