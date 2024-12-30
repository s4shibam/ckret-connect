import colors from 'colors'
import mongoose from 'mongoose'
import { env } from '../constants/env'

export const connectMongo = async () => {
  try {
    const { connection } = await mongoose.connect(env.db_url)

    console.log(
      colors.cyan(`Database connected to "${connection.db?.databaseName}"`)
    )
  } catch (error) {
    console.log(`Database connection error: ${error}`.red)
  }
}

export const disconnectMongo = async () => {
  try {
    await mongoose.connection.close()
    console.log('Database connection closed'.yellow)
  } catch (error) {
    console.log(`Database disconnection error: ${error}`.red)
  }
}
