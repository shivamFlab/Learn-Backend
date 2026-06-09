import mongoose from "mongoose";

export async function connectDB(uri) {
mongoose.set("strictQuery", true);
await mongoose.connect(uri, { dbName: process.env.DB_NAME });
return mongoose.connection;
}