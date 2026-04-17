import { User } from "../models/userModel.js";


// ➕ Add Friend (using CF handle)
export const addFriend = async (req, res) => {
  try {
    const { handle, friendHandle } = req.body;

    if (!handle || !friendHandle) {
      return res.status(400).json({ error: "handle and friendHandle are required" });
    }

    // 🔍 find or create user
    let user = await User.findOne({ codeforcesHandle: handle });

    if (!user) {
      user = await User.create({
        codeforcesHandle: handle,
        friends: [],
      });
    }

    // ❌ avoid duplicates
    if (user.friends.includes(friendHandle)) {
      return res.status(400).json({ error: "Friend already added" });
    }

    // ➕ add friend
    user.friends.push(friendHandle);
    await user.save();

    res.json({
      message: "Friend added",
      user: handle,
      friends: user.friends,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// 📄 Get Friends (using CF handle)
export const getFriends = async (req, res) => {
  try {
    const { handle } = req.query;

    if (!handle) {
      return res.status(400).json({ error: "handle is required" });
    }

    const user = await User.findOne({ codeforcesHandle: handle });

    if (!user) {
      return res.json({ friends: [] }); // no user yet → empty list
    }

    res.json({
      user: handle,
      friends: user.friends,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};