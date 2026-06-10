import { labAdminModel } from "../../server/schema/labAdmin.js";

const getLabAdminLabs = async (req, res) => {
  const aggregatedData = await labAdminModel.aggregate([
    {
      $lookup: {
        from: "labs",
        localField: "_id",
        foreignField: "labAdmin",
        as: "adminLabs",
        pipeline: [
          {
            $lookup: {
              from: "labusers",
              localField: "_id",
              foreignField: "labId",
              as: "labUsers",
              pipeline: [
                {
                  $project: {
                    labId: 1,
                    name: 1,
                    role: 1,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "patients",
              localField: "_id",
              foreignField: "labId",
              as: "labPatients",
              pipeline: [
                {
                  $project: {
                    labId: 1,
                    patientName: 1,
                    gender: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              labName: 1,
              email: 1,
              labUsers: 1,
              labPatients: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        name: 1,
        isActive: 1,
        role: 1,
        adminLabs: 1,
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
