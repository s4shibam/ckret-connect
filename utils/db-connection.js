import mongoose from 'mongoose';

// Setup connection between MongoDB and the server using mongoose
export const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    console.log('DB connected'.cyan);
  } catch (error) {
    console.log(`DB connection error: ${error}`.red);
  }
};
