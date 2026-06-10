import mongoose from "mongoose";
import { labAdminModel } from "../../server/schema/labAdmin.js";

const getLabAdminLabs = async (req, res) => {
  const aggregatedData = await labAdminModel.aggregate([
    {
      $lookup: {
        from: "labs",
        localField: "_id",
        foreignField: "labAdmin",
        as: "Labs",
        pipeline: [
          {
            $lookup: {
              from: "labusers",
              localField: "_id",
              foreignField: "labId",
              as: "labUserData",
            },
          },
          {
            $addFields: {
              labUsersCount: {
                $size: "$labUserData",
              },
            },
          },
          {
            $lookup: {
              from: "bills",
              localField: "_id",
              foreignField: "labId",
              as: "labBillData",
              pipeline: [
                {
                  $project: {
                    patientId: 1,
                    totalAmount: 1,
                    paidAmount: 1,
                    dueAmount: 1,
                    status: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              totalBillCount: {
                $size: "$labBillData",
              },
            },
          },
          {
            $project: {
              labName: 1,
              // labUserData: 1,
              labUsersCount: 1,
              // labBillData: 1,
              totalBillCount: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        name: 1,
        role: 1,
        Labs: 1,
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    message: "Agggregation successfull",
    data: aggregatedData,
  });
};

export { getLabAdminLabs };
