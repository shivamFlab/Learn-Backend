import { signToken } from "../../../utils/signJWT.js";
import { labModel } from "../../schema/lab.js";

const createLabNewLab = async (adminId, { labName, contact, email }) => {
  return labModel.create({
    labAdmin: adminId,
    labName,
    contact,
    email,
  });
};

const createLab = async (req, res) => {
  try {
    const { labName, contact, email } = req.body;

    if (!labName || !contact) {
      return res.status(401).json({
        success: false,
        message: "Fill all the required fields",
      });
    }

    // 1. create new processing lab
    const newLab = await createLabNewLab(req?.labAdminId, {
      labName,
      contact,
      email,
    });

    return res.status(200).json({
      success: true,
      message: "Lab created successfully",
      data: newLab,
    });
  } catch (error) {
    console.error("createLab error:", error);
    return res.status(501).json({
      success: false,
      message: "Something went wrong while creating the lab , please try again",
    });
  }
};

const updateLab = async (req, res) => {
  try {
    const { labName, email, contact } = req.body;
    console.log("we are in updateLab call");

    // 1. find the lab from db
    const labDoc = await labModel.findByIdAndUpdate(
      req.labId,
      {
        labName: labName,
        email: email,
        contact: contact,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "lab update successfull",
      data: labDoc,
    });
  } catch (error) {
    console.error("updateLab error:", error);
    return res.status(501).json({
      success: false,
      message: "Something went wrong while updating the lab , please try again",
    });
  }
};

export { createLab, updateLab, createLabNewLab };
