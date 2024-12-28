import CryptoJS from 'crypto-js'
import { env } from '../constants/env'

export const encryptMessage = (message: string) => {
  try {
    return CryptoJS.AES.encrypt(message, env.encryption_key).toString()
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt message')
  }
}

export const decryptMessage = (encryptedMessage: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, env.encryption_key)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt message')
  }
}
