import { TestModel } from "../../schema/test.js";

const createTest = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(402).json({
        success: false,
        message: "please provide all the required fields",
      });
    }

    const newTest = await TestModel.create({
      labId: req?.labId,
      name: name,
      price: price,
    });

    return res.status(200).json({
      success: true,
      message: "Test created successfully for this lab",
      data: newTest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while creating test, please try again",
    });
  }
};

const getTests = async (req, res) => {
  try {
    const tests = await TestModel.find({ labId: req?.labId });

    return res.status(200).json({
      success: true,
      message: "Tests fetched successfully",
      data: tests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while fetching tests, please try again",
    });
  }
};

const updateTest = async (req, res) => {
  try {
    const { id, name, price } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;

    const updatedTest = await TestModel.findOneAndUpdate(
      { _id: id, labId: req?.labId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedTest) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test updated successfully",
      data: updatedTest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while updating test, please try again",
    });
  }
};

const deleteTest = async (req, res) => {
  try {
    const { id } = req.body;

    const deletedTest = await TestModel.findOneAndDelete({
      _id: id,
      labId: req?.labId,
    });

    if (!deletedTest) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test deleted successfully",
      data: deletedTest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong while deleting test, please try again",
    });
  }
};

export { createTest, getTests, updateTest, deleteTest };
