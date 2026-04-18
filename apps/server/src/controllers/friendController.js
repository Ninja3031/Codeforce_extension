import { User } from "../models/userModel.js";


//  Add Friend (using CF handle)
export const addFriend = async (req, res) => {
  try {
    const { handle, friends, friendHandle } = req.body;

    // Check if there is either an array of friends or a single friendHandle legacy
    if (!handle || (!friends && !friendHandle)) {
      return res.status(400).json({ error: "handle and friends array are required" });
    }

    const friendsToAdd = Array.isArray(friends) ? friends : [friendHandle].filter(Boolean);
    const normalizedFriends = friendsToAdd
      .map(f => String(f).trim())
      .filter(Boolean);

    //  find or create user
    let user = await User.findOne({ codeforcesHandle: handle });

    if (!user) {
      user = await User.create({
        codeforcesHandle: handle,
        friends: [],
      });
    }

    //  add friends securely by checking duplicates
    let addedCount = 0;
    for (const f of normalizedFriends) {
      if (!user.friends.includes(f)) {
        user.friends.push(f);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await user.save();
    }

    res.json({
      message: `${addedCount} friend(s) added`,
      user: handle,
      friends: user.friends,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



//  Get Friends (using CF handle)
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

//  Remove Friend (using CF handle)
export const removeFriend = async (req, res) => {
  try {
    const { handle, friendHandle } = req.body;

    if (!handle || !friendHandle) {
      return res.status(400).json({ error: "handle and friendHandle are required" });
    }

    const user = await User.findOne({ codeforcesHandle: handle });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendIndex = user.friends.indexOf(String(friendHandle).trim());
    if (friendIndex > -1) {
      user.friends.splice(friendIndex, 1);
      await user.save();
    }

    res.json({
      message: "Friend removed successfully",
      friends: user.friends,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};