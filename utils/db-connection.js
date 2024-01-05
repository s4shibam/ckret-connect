import mongoose from 'mongoose';
import { getDatabaseUrl } from './index.js';

// Setup connection between MongoDB and the server using mongoose
export const connectToDB = async () => {
  try {
    const DB_URL = getDatabaseUrl();

    const { connection } = await mongoose.connect(DB_URL);
    const { dbName, srvHost } = connection.getClient().s.options;

    const clusterName = srvHost?.split('.mongodb.net')?.[0];

    console.log('Database Connected'.cyan);
    console.log(`DB Name: ${dbName}`.gray);
    console.log(`Cluster Name: ${clusterName}`.gray);
  } catch (error) {
    console.log(`DB connection error: ${error}`.red);
  }
};
