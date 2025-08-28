import Post from "../models/post.model.js"
import { errorHandler } from "../utils/error.js"

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to create a post!"))
  }

  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Please provide all the required fields!"))
  }

  if (!req.body.title.trim() || !req.body.content.trim()) {
    return next(errorHandler(400, "Title and content cannot be empty!"))
  }

  try {
    // Check if a post with the same title already exists
    const existingPost = await Post.findOne({ title: req.body.title.trim() })
    if (existingPost) {
      return next(errorHandler(400, "A post with this title already exists"))
    }

    const slug = req.body.title
      .trim()
      .split(" ")
      .join("-")
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-]/g, "")

    // Ensure slug is unique
    let uniqueSlug = slug
    let counter = 1
    while (await Post.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    const newPost = new Post({
      title: req.body.title.trim(),
      content: req.body.content.trim(),
      category: req.body.category || 'uncategorized',
      image: req.body.image,
      slug: uniqueSlug,
      userId: req.user.id,
    })

    const savedPost = await newPost.save()

    // Verify the post was saved by fetching it again
    const verifyPost = await Post.findById(savedPost._id)
    if (!verifyPost) {
      return next(errorHandler(500, "Failed to save post to database"))
    }

    console.log(`Post created successfully: ${savedPost.title} (ID: ${savedPost._id})`)

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: savedPost
    })
  } catch (error) {
    console.error('Error creating post:', error)
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0]
      return next(errorHandler(400, `A post with this ${field} already exists`))
    }
    next(error)
  }
}

export const getPosts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0
    const limit = parseInt(req.query.limit) || 9

    const sortDirection = req.query.sort === "asc" ? 1 : -1

    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),

      ...(req.query.category && { category: req.query.category }),

      ...(req.query.slug && { slug: req.query.slug }),

      ...(req.query.postId && { _id: req.query.postId }),

      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit)

    const totalPosts = await Post.countDocuments()

    const now = new Date() // 2024 15 Nov

    const oneMonthAgo = new Date( // 2024 15 Oct
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    )

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    })

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    })
  } catch (error) {
    next(error)
  }
}

export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(
      errorHandler(403, "You are not authorized to delete this post!")
    )
  }

  try {
    await Post.findByIdAndDelete(req.params.postId)

    res.status(200).json("Post has been deleted!")
  } catch (error) {
    next(error)
  }
}

export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(
      errorHandler(403, "You are not authorized to update this post!")
    )
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true }
    )

    res.status(200).json(updatedPost)
  } catch (error) {
    next(error)
  }
}
