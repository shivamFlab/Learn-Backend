import { model, Schema } from "mongoose";

const patientSchema = new Schema(
  {
    labId: {
      type: Schema.Types.ObjectId,
      ref: "lab",
      required: true,
      index: true,
    },
    patientName: { type: String, required: true },
    gender: {
      type: String,
      required: false,
      default: "male",
      enum: ["male", "female", "other"],
    },
  },
  {
    timestamps: true,
  }
);

export const PatientModel = model("Patient", patientSchema);
