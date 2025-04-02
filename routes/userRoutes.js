import express from "express";
import crypto from "crypto";
import { User } from "../models/User.js";

const router = express.Router();


//Register or Retrieve User

router.post("/register", async (req, res) => {
  try {
    const { userAgent, ip } = req.body;

    // Check if user exists
    let user = await User.findOne({ userAgent, ip });

    if (!user) {
      const newUUID = crypto.randomUUID();
      user = new User({
        uuid: newUUID,
        userAgent,
        ip,
        logs: [{ action: "User Registered", timestamp: new Date() }],
      });
      await user.save();
    } else {
      user.logs.push({ action: "User Login", timestamp: new Date() });
      await user.save();
    }

    res.json({ uuid: user.uuid });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/blocked-users/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    const user = await User.findOne({ uuid });

    if (!user) return res.status(404).json({ error: "User not found" });
    console.log(user.blockedUsers);

    res.json({ blockedUsers: user.blockedUsers });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});



router.post("/block-user", async (req, res) => {
  try {
    const { uuid, blockUsername } = req.body;

    const user = await User.findOne({ uuid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isAlreadyBlocked = user.blockedUsers.find(
      (blocked) => blocked.username === blockUsername
    );

    if (isAlreadyBlocked) {
      return res.status(409).json({ error: "User is already blocked" });
    }

    const newBlockedUser = { username: blockUsername };
    user.blockedUsers.push(newBlockedUser);

    user.logs.push({ action: `Blocked User: ${blockUsername}`, timestamp: new Date() });

    await user.save();

    const addedUser = user.blockedUsers.find((blocked) => blocked.username === blockUsername);

    res.status(201).json({
      message: "User Blocked Successfully",
      blockedUserUUID: addedUser._id 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});


// DELETE endpoint to unblock a user
router.delete("/block-user/:uuid/:blockUserId", async (req, res) => {
  try {
    const { uuid, blockUserId } = req.params;

    const user = await User.findOne({ uuid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const initialBlockedUsersLength = user.blockedUsers.length;
    user.blockedUsers = user.blockedUsers.filter(
      (blocked) => blocked._id.toString() !== blockUserId
    );

    if (user.blockedUsers.length === initialBlockedUsersLength) {
      return res.status(404).json({ error: "Blocked user not found" });
    }

    const unblockedUser = user.blockedUsers.find(
      (blocked) => blocked._id.toString() === blockUserId
    );

    const unblockedUsername = unblockedUser ? unblockedUser.username : "Unknown User";

    user.logs.push({ action: `Unblocked User: ${unblockedUsername} (ID: ${blockUserId})`, timestamp: new Date() });

    await user.save();
    res.json({ message: "User Unblocked Successfully", blockedUsers: user.blockedUsers });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
