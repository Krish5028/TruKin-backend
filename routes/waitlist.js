const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

// Helper function: decide rank based on points
function getRank(points) {
  if (points >= 250) return '👑 Legend';
  if (points >= 100) return '💎 Diamond';
  if (points >= 50)  return '🥇 Gold';
  if (points >= 10)  return '🥈 Silver';
  return '🥉 Bronze';
}

// -----------------------------------------------
// POST /waitlist  — called when someone joins
// -----------------------------------------------
router.post('/waitlist', async (req, res) => {
  try {
    const { name, email, skin_concern, ref } = req.body;

    // 1. Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ detail: 'This email is already on the waitlist!' });
    }

    // 2. Generate a unique referral code for the new user
    const referralCode = uuidv4().slice(0, 8).toUpperCase(); // e.g. "A3F9B1C2"

    // 3. Create the new user
    const newUser = new User({
      name,
      email,
      skinConcern: skin_concern,
      referralCode,
      referredBy: ref || null
    });

    await newUser.save();

    // 4. If this user was referred by someone, give that person +10 points
    if (ref) {
      const referrer = await User.findOne({ referralCode: ref });
      if (referrer) {
        referrer.points += 10;
        referrer.rank = getRank(referrer.points);
        await referrer.save();
      }
    }

    // 5. Build the referral link to send back to the new user
    const referralLink = `https://yourdomain.com/?ref=${referralCode}`;
    // 🔁 Replace yourdomain.com with your actual domain when you go live

    // 6. Send success response
    res.status(200).json({
      message: 'Successfully joined the waitlist!',
      name: newUser.name,
      referralCode,
      referralLink,
      points: newUser.points,
      rank: newUser.rank
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: 'Server error. Please try again.' });
  }
});

// -----------------------------------------------
// GET /leaderboard  — top 50 users by points
// -----------------------------------------------
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ points: -1 })
      .limit(50)                               // top 50 users
      .select('name points rank referralCode'); // referralCode needed to highlight current user

    res.status(200).json(topUsers);
  } catch (err) {
    res.status(500).json({ detail: 'Server error' });
  }
});

// -----------------------------------------------
// GET /myrank?code=REFERRALCODE
// Returns a specific user's rank position (for users below top 50)
// -----------------------------------------------
router.get('/myrank', async (req, res) => {
  try {
    const { code } = req.query;

    // Find the user by their referral code
    const user = await User.findOne({ referralCode: code });
    if (!user) return res.status(404).json({ detail: 'User not found' });

    // Count how many users have MORE points to find their position
    const position = await User.countDocuments({ points: { $gt: user.points } });

    res.status(200).json({
      name:         user.name,
      points:       user.points,
      rank:         user.rank,
      referralCode: user.referralCode,
      position:     position + 1  // +1 because positions are 1-based
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: 'Server error' });
  }
});

module.exports = router;
