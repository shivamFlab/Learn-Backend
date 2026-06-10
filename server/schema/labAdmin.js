import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const labAdminSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    contact: { type: String, required: [true, "Contact is required"] },
    email: { type: String, required: false },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    password: { type: String, required: [true, "Password is required"] },
    isActive: { type: Boolean, required: false },
    role: { type: String, required: false, default: "labAdmin" },
  },
  {
    timestamps: true,
  }
);

labAdminSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

export const labAdminModel = model("labAdmin", labAdminSchema);
