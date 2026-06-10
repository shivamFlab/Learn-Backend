import { model, Schema } from "mongoose";

const billSchema = new Schema(
  {
    labId: { type: Schema.Types.ObjectId, ref: "lab", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    dueAmount: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      default: "unpaid",
      enum: ["paid", "unpaid", "partial"],
    },
    tests: [{ type: Schema.Types.ObjectId, ref: "Test" }],
  },
  {
    timestamps: true,
  }
);

export const BillModel = model("Bill", billSchema);
