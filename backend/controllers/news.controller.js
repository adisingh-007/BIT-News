import axios from 'axios'
import { errorHandler } from '../utils/error.js'

// Map UI categories to NewsAPI categories where applicable
const categoryMap = {
  Technology: 'technology',
  Business: 'business',
  Health: 'health',
  Science: 'science',
  Sports: 'sports',
  Entertainment: 'entertainment',
  Environment: null,
  Education: null,
  uncategorized: null,
}

export const getTopHeadlines = async (req, res, next) => {
  try {
    const apiKey = process.env.NEWS_API_KEY
    if (!apiKey) return next(errorHandler(500, 'NEWS_API_KEY not configured'))

    const { category = '', country = 'us', q = '' } = req.query

    const mappedCategory = categoryMap[category] ?? ''

    const params = {
      apiKey,
      country,
      pageSize: 20,
    }

    if (mappedCategory) params.category = mappedCategory
    if (q) params.q = q

    const url = 'https://newsapi.org/v2/top-headlines'
    const { data } = await axios.get(url, { params })

    // Normalize articles to your PostCard expectations
    const articles = (data.articles || []).map((a, idx) => ({
      _id: `${a.source?.id || 'src'}-${idx}-${Date.now()}`,
      title: a.title,
      content: a.description || '',
      category: category || 'News',
      image: a.urlToImage || '',
      slug: encodeURIComponent(a.title?.toLowerCase().replace(/\s+/g, '-') || `news-${idx}`),
      externalUrl: a.url,
      updatedAt: a.publishedAt || new Date().toISOString(),
    }))

    res.status(200).json({ articles })
  } catch (err) {
    next(err)
  }
}