// This defines what each user looks like in MongoDB
// Think of it like a form template for the database

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true   // must be provided
  },

  email: {
    type: String,
    required: true,
    unique: true     // no two users can have same email
  },

  skinConcern: {
    type: String,
    required: true
  },

  // Each user gets their own unique referral code
  referralCode: {
    type: String,
    unique: true
  },

  // Stores the code of whoever referred this user (if any)
  referredBy: {
    type: String,
    default: null
  },

  // Points earned by referring others
  points: {
    type: Number,
    default: 0
  },

  // Rank based on points
  rank: {
    type: String,
    default: 'Bronze'
  }

}, { timestamps: true }); // auto adds createdAt and updatedAt

module.exports = mongoose.model('User', userSchema);