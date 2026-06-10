import { describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { verifyToken } from "../../server/middleware/verifyToken.js";

// Minimal express req/res/next doubles.
function makeRes() {
  return {
    statusCode: undefined,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

const sign = (payload, opts) =>
  jwt.sign(payload, process.env.JWT_SECRET, opts);

describe("verifyToken middleware", () => {
  it("rejects a request with no Authorization header (402)", () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(res.statusCode).toBe(402);
    expect(res.body.message).toBe("No token provided");
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a header that does not start with 'Bearer ' (402)", () => {
    const req = { headers: { authorization: "Token abc" } };
    const res = makeRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(res.statusCode).toBe(402);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next and populates req for a valid token", () => {
    const token = sign({ labAdminId: "a1", labId: "l1", role: "labAdmin" });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = makeRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.labAdminId).toBe("a1");
    expect(req.labId).toBe("l1");
    expect(res.statusCode).toBeUndefined();
  });

  it("rejects a token signed with the wrong secret (401 invalid)", () => {
    const token = jwt.sign({ labId: "l1" }, "some-other-secret");
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = makeRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token");
    expect(next).not.toHaveBeenCalled();
  });

  it("reports an expired token distinctly (401 expired)", () => {
    const token = sign({ labId: "l1" }, { expiresIn: -10 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = makeRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Token expired, please login again");
  });

  it("rejects a malformed token after the Bearer prefix (401)", () => {
    const req = { headers: { authorization: "Bearer not-a-jwt" } };
    const res = makeRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});
