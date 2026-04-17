import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,

    // 👇 Important
    codeforcesHandle: String,

    friends: [
      {
        type: String, // CF handles
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);