const mongoose = require('mongoose');

/**
 * Student Schema definition using Mongoose
 * Collection: 'students' in database: 'studentDB'
 */
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Year of study is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'students', // Explicitly set collection name
  }
);

module.exports = mongoose.model('Student', studentSchema);

