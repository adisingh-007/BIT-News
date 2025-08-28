import express from 'express'
import { getTopHeadlines } from '../controllers/news.controller.js'

const router = express.Router()

// GET /api/news/top-headlines?category=Technology&country=us&q=ai
router.get('/top-headlines', getTopHeadlines)

export default router