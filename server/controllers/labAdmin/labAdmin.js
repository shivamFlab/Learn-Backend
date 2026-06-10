import bcrypt from "bcrypt";
import { signToken } from "../../../utils/signJWT.js";
import { labAdminModel } from "../../schema/labAdmin.js";
import { labModel } from "../../schema/lab.js";
import { createLabNewLab } from "../lab/lab.js";

const labAdminSignup = async (req, res) => {
  try {
    const { name, contact, email, username, password, labName } = req.body;

    // 1. empty field check
    if (!name || !contact || !username || !password || !labName) {
      return res.status(401).json({
        success: false,
        message: "Fill all the required fields",
      });
    }

    // 3. now make entry in the database
    const newlabAdmin = await labAdminModel.create({
      name,
      contact,
      email,
      username,
      password,
      isActive: true,
    });
    // console.log({newlabAdmin})

    // 4. remove password from it
    const { password: _password, ...safeLabAdmin } = newlabAdmin.toObject();

    // 5.creating the default lab for them
    const defaultLab = await createLabNewLab(newlabAdmin._id, {
      labName,
      contact,
      email,
    });

    console.log({ defaultLab });

    // 6. now assigning the JWT token
    const token = signToken(defaultLab);

    return res.status(200).json({
      success: true,
      message: "labAdmin created successfully",
      data: safeLabAdmin,
      token: token,
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        message: `An account with this ${field} already exists.`,
      });
    }

    return res.status(501).json({
      success: false,
      message: "Something went wrong , please try again",
      error: err,
    });
  }
};

const labAdminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(401).json({
        success: false,
        message: "Fill all the required fields",
      });
    }

    // 1. find the admin by username
    const existingAdmin = await labAdminModel.findOne({ username });
    if (!existingAdmin) {
      return res.status(401).json({
        success: false,
        message: "labAdmin does not exist",
      });
    }

    // 2. verify the password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingAdmin.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // 4. remove password from it
    const { password: _password, ...safeLabAdmin } = existingAdmin.toObject();

    // 5. fetch their lab to build the token
    const adminLab = await labModel.findOne({ labAdmin: existingAdmin._id });

    // 6. now assigning the JWT token
    const token = signToken(adminLab);

    return res.status(200).json({
      success: true,
      message: "labAdmin logged in successfully",
      data: safeLabAdmin,
      token: token,
    });
  } catch (err) {
    return res.status(501).json({
      success: false,
      message: "Something went wrong , please try again",
      error: err,
    });
  }
};

export { labAdminSignup, labAdminLogin };
