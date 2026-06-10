import { model, Schema } from "mongoose";

const testSchema = new Schema(
  {
    labId: { type: Schema.Types.ObjectId, ref: "lab", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const TestModel = model("Test", testSchema);
