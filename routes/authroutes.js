// routes/userRoute.js

const express = require('express');
const router = express.Router();
const bcrypt =require("bcryptjs")
const User = require('../models/user');
const jwt = require('jsonwebtoken');  // for token after login
// const protect = require('../middleware/authMiddleware');

// Create User
router.post('/user', async (req, res) => {
  const { name, group, email, role,password } = req.body;
  if (!name || !group || !email || !role || !password) {
    return res.status(400).json({ error: 'All fields including password are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user object using schema
    const newUser = new User({ name, group, email, role,password:hashedPassword });
    // 🔽 Skip save(), just return object (for now)
    console.log('✅ New User (Schema Style):', newUser);
    await newUser.save();

    
    res.status(200).json({
      success: true,
      message: 'User schema created successfully',
      user: {
        name: newUser.name,
        group: newUser.group,
        email: newUser.email,
        role: newUser.role,
        // DO NOT send password back in response
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User
router.get('/users',  async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get User by ID for Update
router.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete User
router.delete('/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Input Validation
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  // 2. Check if user exists
  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).json({ error: 'Invalid credentials' });

  // 3. Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(401).json({ error: 'Invalid credentials' });

  // 4. Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // 5. Send token and user info
  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      group: user.group
    }
  });
});



module.exports = router;




// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

//   const user = await User.findOne({ email });
//   if (!user) return res.status(401).json({ error: 'Invalid credentials' });

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

//   const token = jwt.sign(
//     { id: user._id, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRES_IN }
//   );

//   res.status(200).json({
//     success: true,
//     message: 'Login successful',
//     token,
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       group: user.group
//     }
//   });
// });
