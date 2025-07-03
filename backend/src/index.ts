import dotenv from 'dotenv-flow'
dotenv.config()

import mongoose from 'mongoose'
import app from './app'

const { DB_URI, DB_NAME, PORT = 3000 } = process.env

if (!DB_URI || !DB_NAME) {
  console.error('❌ Missing MongoDB environment variables')
  process.exit(1)
}

const startServer = async () => {
  try {
    await mongoose.connect(DB_URI, { dbName: DB_NAME })
    console.info('✅ Connected to MongoDB')

    app.listen(PORT, () => {
      console.info(`🚀 Server listening at http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  }
}

startServer()
