import multer from "multer"
import path from "path"
import fs from "fs"
import { errorHandler } from "../utils/error.js"

// Create uploads directory if it doesn't exist
const uploadsDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'post-image-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Upload image endpoint
export const uploadImage = (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(errorHandler(400, 'File too large. Maximum size is 5MB'))
      }
      return next(errorHandler(400, err.message))
    } else if (err) {
      return next(errorHandler(400, err.message))
    }

    if (!req.file) {
      return next(errorHandler(400, 'No image file provided'))
    }

    // Return the image URL. Use host header to support deployments behind domains.
    const protocol = req.headers['x-forwarded-proto'] || req.protocol
    const host = req.get('host')
    const baseUrl = `${protocol}://${host}`
    const imageUrl = `${baseUrl}/api/uploads/${req.file.filename}`
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl
    })
  })
}