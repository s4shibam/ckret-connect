import colors from 'colors'
import mongoose from 'mongoose'
import { env } from '../constants/env'

export const connectMongo = async () => {
  try {
    const { connection } = await mongoose.connect(env.db_url)

    console.log(
      colors.cyan(`Mongo connected to "${connection.db?.databaseName}"`)
    )
  } catch (error) {
    console.log(`Mongo connection error: ${error}`.red)
  }
}

export const disconnectMongo = async () => {
  try {
    await mongoose.connection.close()
    console.log('Mongo connection closed'.yellow)
  } catch (error) {
    console.log(`Mongo disconnection error: ${error}`.red)
  }
}
