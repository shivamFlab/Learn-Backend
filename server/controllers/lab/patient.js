import { PatientModel } from "../../schema/patient.js";

const createPatient = async (req, res) => {
  try {
    const { patientName, gender } = req.body;
    if (!patientName) {
      return res.status(402).json({
        success: false,
        message: "please provide all the required fields",
      });
    }

    const newPatient = await PatientModel.create({
      labId: req?.labId,
      patientName: patientName,
      gender: gender,
    });

    // console.log({ newPatient });

    return res.status(200).json({
      success: true,
      message: "Patient created successfully for this lab",
      data: newPatient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while creating patient, please try again",
    });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await PatientModel.find({ labId: req?.labId });

    return res.status(200).json({
      success: true,
      message: "Patients fetched successfully",
      data: patients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while fetching patients, please try again",
    });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { id, patientName, gender } = req.body;

    const updates = {};
    if (patientName !== undefined) updates.patientName = patientName;
    if (gender !== undefined) updates.gender = gender;

    const updatedPatient = await PatientModel.findOneAndUpdate(
      { _id: id, labId: req?.labId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while updating patient, please try again",
    });
  }
};

const deletePatient = async (req, res) => {
  try {
    const { id } = req.body;

    const deletedPatient = await PatientModel.findOneAndDelete({
      _id: id,
      labId: req?.labId,
    });

    if (!deletedPatient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
      data: deletedPatient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while deleting patient, please try again",
    });
  }
};

export { createPatient, getPatients, updatePatient, deletePatient };
