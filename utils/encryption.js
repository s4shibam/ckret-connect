import CryptoJS from 'crypto-js'
import { ENV } from '../constants/index.js'

export const encryptMessage = (message) => {
  try {
    return CryptoJS.AES.encrypt(message, ENV.encryption_key).toString()
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt message')
  }
}

export const decryptMessage = (encryptedMessage) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENV.encryption_key)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt message')
  }
}
