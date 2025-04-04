const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');
const { Op } = require('sequelize');
require('dotenv').config();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { 
      studentId, 
      staffId, 
      firstName, 
      lastName, 
      firstNameEn, 
      lastNameEn, 
      email, 
      phone, 
      password, 
      department, 
      faculty 
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Check student or staff ID
    if (studentId) {
      const studentExists = await User.findOne({ where: { studentId } });
      if (studentExists) {
        return res.status(400).json({
          status: 'error',
          message: 'User with this student ID already exists'
        });
      }
    } else if (staffId) {
      const staffExists = await User.findOne({ where: { staffId } });
      if (staffExists) {
        return res.status(400).json({
          status: 'error',
          message: 'User with this staff ID already exists'
        });
      }
    }

    // Determine user role
    let role = 'student';
    if (staffId) {
      role = 'staff';
    }

    // Create user
    const user = await User.create({
      studentId,
      staffId,
      firstName,
      lastName,
      firstNameEn,
      lastNameEn,
      email,
      phone,
      password,
      role,
      department,
      faculty
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user.id,
        studentId: user.studentId,
        staffId: user.staffId,
        firstName: user.firstName,
        lastName: user.lastName,
        firstNameEn: user.firstNameEn,
        lastNameEn: user.lastNameEn,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        faculty: user.faculty,
        language: user.language
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt received:', { email, passwordProvided: !!password });

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }
    
    // DEVELOPMENT MODE: Allow test accounts with password "admin123"
    if (email.includes('@odocs.devapp.cc') && password === 'admin123') {
      console.log('Development mode: Using test account login');
      
      // Find user in database
      let user = await User.findOne({ where: { email } });
      
      if (user) {
        console.log('Found existing user in database:', email);
        
        // Generate token
        const token = generateToken(user.id);
        
        return res.status(200).json({
          status: 'success',
          token,
          user: {
            id: user.id,
            studentId: user.studentId,
            staffId: user.staffId,
            firstName: user.firstName,
            lastName: user.lastName,
            firstNameEn: user.firstNameEn,
            lastNameEn: user.lastNameEn,
            email: user.email,
            phone: user.phone,
            role: user.role,
            department: user.department,
            faculty: user.faculty,
            language: user.language,
            approverLevel: user.approverLevel
          }
        });
      } else {
        // If user doesn't exist in database, create a real user
        console.log('Creating real user in database for:', email);
        
        // Determine role and other details based on email
        let role = 'student';
        let approverLevel = null;
        let firstName = email.split('@')[0];
        let lastName = 'User';
        
        if (email.includes('admin')) {
          role = 'admin';
          firstName = 'Admin';
        } else if (email.includes('staff')) {
          role = 'staff';
          firstName = 'Staff';
        } else if (email.includes('advisor')) {
          role = 'approver';
          approverLevel = 'advisor';
          firstName = 'Advisor';
        } else if (email.includes('department_head')) {
          role = 'approver';
          approverLevel = 'department_head';
        } else if (email.includes('dean')) {
          role = 'approver';
          approverLevel = 'dean';
        } else if (email.includes('registrar')) {
          role = 'approver';
          approverLevel = 'registrar';
        }
        
        // Create a real user in the database
        user = await User.create({
          email,
          firstName,
          lastName,
          password: 'admin123', // This will be hashed by the model hooks
          role,
          approverLevel,
          language: 'en'
        });
        
        // Generate token
        const token = generateToken(user.id);
        
        return res.status(200).json({
          status: 'success',
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            language: user.language,
            approverLevel: user.approverLevel
          }
        });
      }
    }

    // Normal authentication flow
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user.id,
        studentId: user.studentId,
        staffId: user.staffId,
        firstName: user.firstName,
        lastName: user.lastName,
        firstNameEn: user.firstNameEn,
        lastNameEn: user.lastNameEn,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        faculty: user.faculty,
        language: user.language,
        approverLevel: user.approverLevel
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // User is already available in req.user from the auth middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
    });

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'There is no user with that email'
      });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });

      res.status(200).json({
        status: 'success',
        message: 'Email sent'
      });
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;

      await user.save();

      return res.status(500).json({
        status: 'error',
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      status: 'success',
      token
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      status: 'success',
      token
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};