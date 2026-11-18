const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas NoSQL Database
 * Using Mongoose ODM
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn('⚠️  [MongoDB Warning] MONGO_URI is not defined in your .env file.');
    console.warn('👉  Please create a .env file based on .env.example with your MongoDB Atlas URI:');
    console.warn('    MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/studentDB?retryWrites=true&w=majority\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      dbName: 'studentDB', // Explicitly use studentDB database
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📁 Active Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('👉  Troubleshooting Tips:');
    console.error('    1. Check if Network Access in MongoDB Atlas allows IP 0.0.0.0/0 (or your current IP).');
    console.error('    2. Verify the username and password in the connection string.');
    console.error('    3. Ensure no special characters in password break the URL (URL encode if necessary).\n');
    return false;
  }
};

module.exports = connectDB;

