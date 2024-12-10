import mongoose from 'mongoose'
import Message from '../models/message.model.js'
import { connectToDB } from '../utils/db-connection.js'
import { encryptMessage } from '../utils/encryption.js'

const migrateMessages = async () => {
  try {
    // Connect to database
    await connectToDB()

    // Find all messages with old content field
    const messages = await Message.find({ content: { $exists: true } })
    console.log(`Found ${messages.length} messages to migrate`)

    const results = await Promise.all(
      messages.map(async (message) => {
        try {
          // Encrypt the content
          const encryptedContent = encryptMessage(message.content)

          // Using $unset to properly remove the content field
          await Message.findByIdAndUpdate(
            message._id,
            {
              $set: { encrypted_content: encryptedContent },
              $unset: { content: '' }
            },
            { strict: true, overwrite: false }
          )

          console.log(`Migrated message ${message._id}`)
          return { success: true }
        } catch (error) {
          console.error(`Failed to migrate message ${message._id}:`, error)
          return { success: false }
        }
      })
    )

    const successCount = results.filter((r) => r.success).length
    const errorCount = results.filter((r) => !r.success).length

    console.log('\nMigration Summary:')
    console.log(`Total messages processed: ${messages.length}`)
    console.log(`Successfully migrated: ${successCount}`)
    console.log(`Failed to migrate: ${errorCount}`)
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from database')
  }
}

// Run migration
migrateMessages()
