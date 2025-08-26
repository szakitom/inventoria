import express from 'express'
import api from './routes/api'

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api', api)

app.set('trust proxy', 2)

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: err.message || 'Unknown server error' })
})

export default app
