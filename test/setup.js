import { afterAll, afterEach, beforeAll, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Deterministic env for JWT signing/verification across the whole suite.
process.env.JWT_SECRET = "test-secret";
process.env.DB_NAME = "test";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "test" });
});

// Wipe every collection between tests so each case starts from a clean slate.
afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
  vi.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
