import { labUsersModel } from "../../schema/labUsers.js";

const createLabUser = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(402).json({
        success: false,
        message: "please provide all the required fields",
      });
    }

    // 1. create lab user
    const newLabUser = await labUsersModel.create({
      labId: req?.labId,
      name: name,
      username: username,
      password: password,
    });

    console.log({newLabUser})

    //2 remove password
    const { password: _ignore, ...restNewLabUserData } = newLabUser.toObject();

    return res.status(200).json({
      success: true,
      message: "User created successfully for this lab",
      data: restNewLabUserData,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `An account with this ${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "something went wrong while creating lab user, please try again",
    });
  }
};

export { createLabUser };
