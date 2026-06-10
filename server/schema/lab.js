import { Schema, model } from "mongoose";

const labSchema = new Schema(
  {
    labAdmin: { type: Schema.Types.ObjectId, ref: "labAdmin", required: true },
    labName: { type: String, required: [true, "Lab name is required"] },
    contact: { type: String, required: [true, "Lab contact is required"] },
    email: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export const labModel = model("lab", labSchema);
