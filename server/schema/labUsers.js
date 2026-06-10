import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const labUserSchema = new Schema(
  {
    labId: { type: Schema.Types.ObjectId, ref: "lab", required: true , index:true},
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      default: "labUser",
    },
  },
  {
    timestamps: true,
  }
);

labUserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

export const labUsersModel = model("labUser", labUserSchema);
