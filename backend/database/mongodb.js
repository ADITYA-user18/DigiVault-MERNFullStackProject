import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

const ConnectDB = () => {
  const URI = process.env.MONGODB_URI; // Use environment variable

  mongoose.connect(URI)
  .then(() => console.log('✅ Database Connected'))
  .catch((error) => console.error('❌ Failed to connect to the database:', error));
};

export default ConnectDB;
