import { User } from "../models/userModel.js";

//  Create User
export const createUser = async (req, res) => {
  try {
    const { username, codeforcesHandle } = req.body;

    if (!username || !codeforcesHandle) {
      return res.status(400).json({ error: "username and codeforcesHandle are required" });
    }

    const user = await User.create({
      username,
      codeforcesHandle,
      friends: [],
    });

    res.status(201).json({
      message: "User created",
      data: user,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};