import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"

import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import commentRoutes from "./routes/comment.route.js"
import newsRoutes from "./routes/news.route.js"

dotenv.config()

// Resolve __dirname in ES modules
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("Starting server...")
console.log("MONGO_URI exists:", !!process.env.MONGO_URI)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Database is connected successfully")
    console.log(`📊 Connected to database: ${mongoose.connection.name}`)
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err)
    process.exit(1)
  })

// Handle database connection events
mongoose.connection.on('error', (err) => {
  console.error('Database error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('Database disconnected')
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('Database connection closed due to application termination')
  process.exit(0)
})

const app = express()

// If behind reverse proxy (e.g., Vercel, Render, Nginx), trust proxy for correct protocol/ip
app.set('trust proxy', 1)

// CORS middleware (dev + prod)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL // e.g., https://your-frontend-domain.com
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // Allow REST tools and same-origin
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

// for allowing json object in req body
app.use(express.json())
app.use(cookieParser())

// Serve static files from uploads directory (works in prod too)
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/post", postRoutes)
app.use("/api/comment", commentRoutes)
app.use("/api/news", newsRoutes)

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

const PORT = process.env.PORT || 5000
const MAX_PORT = 5010 // Limit port search to reasonable range

const startServer = (port) => {
  if (port > MAX_PORT) {
    console.error(`❌ Cannot find available port between ${process.env.PORT || 5000} and ${MAX_PORT}`)
    process.exit(1)
  }

  const server = app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}!`)
    console.log(`🌐 Server URL: http://localhost:${port}`)
    console.log(`📋 Health check: http://localhost:${port}/api/health`)
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is busy, trying port ${parseInt(port) + 1}...`)
      startServer(parseInt(port) + 1)
    } else {
      console.error('Server error:', err)
      process.exit(1)
    }
  })

  return server
}

startServer(parseInt(PORT))