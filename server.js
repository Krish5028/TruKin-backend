// This is the entry point of your backend
// It starts the server and connects everything together

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // loads your .env file

const app = express();

// Allows your HTML frontend to talk to this backend
app.use(cors());

// Allows the server to read JSON data sent from the form
app.use(express.json());

// Connect to MongoDB using the link from your .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// Load the routes (API endpoints)
app.use('/', require('./routes/waitlist'));

// Start the server on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));