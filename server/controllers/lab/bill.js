import { BillModel } from "../../schema/bill.js";
import { randomUUID } from "crypto";

const payStatus = ["paid", "unpaid", "partial"];

const createBill = async (req, res) => {
  try {
    const { totalAmount, paidAmount = 0, tests, patientId } = req.body;
    if (!totalAmount) {
      return res.status(402).json({
        success: false,
        message: "please provide all the required fields",
      });
    }

    const due = totalAmount - paidAmount;
    let status = due === 0 ? "paid" : paidAmount > 0 ? "partial" : "unpaid";

    const newBill = await BillModel.create({
      labId: req?.labId,
      patientId: patientId,
      totalAmount: totalAmount,
      paidAmount: paidAmount,
      dueAmount: due,
      status: status,
      tests: tests || [], // for now we will change it
    });

    return res.status(200).json({
      success: true,
      message: "Bill created successfully for this lab",
      data: newBill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while creating bill, please try again",
    });
  }
};

const getBills = async (req, res) => {
  try {
    const bills = await BillModel.find({ labId: req?.labId });

    return res.status(200).json({
      success: true,
      message: "Bills fetched successfully",
      data: bills,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while fetching bills, please try again",
    });
  }
};

const updateBill = async (req, res) => {
  try {
    const { billId, newTests, updatedPaidAmount } = req.body;

    // finding bill first
    const prevBill = await BillModel.findById({
      _id: billId,
      labId: req?.labId,
    });
    if (!prevBill) {
      return res.status(402).json({
        success: false,
        message: "Bill not found",
      });
    }
    // console.log({ prevBill });

    const due = prevBill?.totalAmount - updatedPaidAmount;
    let newStatus = due === 0 ? "paid" : updatedPaidAmount > 0 ? "partial" : "unpaid";

    const updatedBill = await BillModel.findOneAndUpdate(
      { _id: billId, labId: req?.labId },
      {
        totalAmount: prevBill?.totalAmount,
        paidAmount: updatedPaidAmount,
        dueAmount: due,
        status: newStatus,
        tests: newTests,
      },
      { new: true, runValidators: true }
    );

    if (!updatedBill) {
      return res.status(404).json({
        success: false,
        message: "Bill not created!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      data: updatedBill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while updating bill, please try again",
    });
  }
};

const deleteBill = async (req, res) => {
  try {
    const { id } = req.body;

    const deletedBill = await BillModel.findOneAndDelete({
      _id: id,
      labId: req?.labId,
    });

    if (!deletedBill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bill deleted successfully",
      data: deletedBill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while deleting bill, please try again",
    });
  }
};

export { createBill, getBills, updateBill, deleteBill };
