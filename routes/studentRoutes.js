const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../models/Student');

// Middleware to check database connection status
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is not connected. Please configure MONGO_URI in your .env file and ensure Atlas cluster is accessible.',
    });
  }
  next();
};

router.use(checkDbConnection);

/**
 * @route   GET /api/students
 * @desc    Get all students or search by keyword (name, rollNo, department)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { name: searchRegex },
          { rollNo: searchRegex },
          { department: searchRegex },
        ],
      };
    }

    // Sort by most recently added/updated
    const students = await Student.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/students/:id
 * @desc    Get single student by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/students
 * @desc    Add a new student
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, rollNo, email, department, year } = req.body;

    // Basic empty field validation
    if (!name || !rollNo || !email || !department || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Name, Roll No, Email, Department, and Year',
      });
    }

    const student = new Student({
      name: name.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      year: year.trim(),
    });

    const savedStudent = await student.save();

    res.status(201).json({
      success: true,
      message: 'Student record added successfully!',
      data: savedStudent,
    });
  } catch (error) {
    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'rollNo' ? 'Roll Number' : field === 'email' ? 'Email' : field;
      return res.status(400).json({
        success: false,
        message: `A student with this ${fieldName} already exists in the database.`,
      });
    }

    // Handle Mongoose schema validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    console.error('Error adding student:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating student record',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/students/:id
 * @desc    Update an existing student record
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, rollNo, email, department, year } = req.body;

    // Basic validation
    if (!name || !rollNo || !email || !department || !year) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required for updating student record',
      });
    }

    const updatedData = {
      name: name.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      year: year.trim(),
    };

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true, // return updated document
        runValidators: true, // run schema validators on update
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found for update',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student record updated successfully!',
      data: student,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'rollNo' ? 'Roll Number' : field === 'email' ? 'Email' : field;
      return res.status(400).json({
        success: false,
        message: `Another student already has this ${fieldName}.`,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    console.error('Error updating student:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating student',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student record
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found for deletion',
      });
    }

    res.status(200).json({
      success: true,
      message: `Student "${student.name}" (Roll No: ${student.rollNo}) deleted successfully!`,
      data: student,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    console.error('Error deleting student:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student',
      error: error.message,
    });
  }
});

module.exports = router;

