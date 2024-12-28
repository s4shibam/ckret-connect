import colors from 'colors'
import mongoose from 'mongoose'
import { env } from '../constants/env'

// MongoDB connection via mongoose
export const connectToDB = async () => {
  try {
    const queries = 'retryWrites=true&w=majority'
    const databaseUrl = `${env.db_connection_string}/${env.db_name}?${queries}`

    const { connection } = await mongoose.connect(databaseUrl)

    console.log(
      colors.cyan(`Database Connected to "${connection.db?.databaseName}"`)
    )
  } catch (error) {
    console.log(`DB connection error: ${error}`.red)
  }
}
