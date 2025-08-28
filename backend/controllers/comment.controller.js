import Comment from "../models/comment.model.js"
import { errorHandler } from "../utils/error.js"

export const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId } = req.body

    if (!content || !content.trim()) {
      return next(errorHandler(400, "Comment content is required"))
    }

    if (!postId) {
      return next(errorHandler(400, "Post ID is required"))
    }

    if (!userId) {
      return next(errorHandler(400, "User ID is required"))
    }

    if (userId !== req.user.id) {
      return next(errorHandler(403, "You are not allowed to add comment!"))
    }

    // Verify the post exists
    const Post = (await import('../models/post.model.js')).default
    const postExists = await Post.findById(postId)
    if (!postExists) {
      return next(errorHandler(404, "Post not found"))
    }

    // Verify the user exists
    const User = (await import('../models/user.model.js')).default
    const userExists = await User.findById(userId)
    if (!userExists) {
      return next(errorHandler(404, "User not found"))
    }

    const newComment = new Comment({
      content: content.trim(),
      postId,
      userId,
    })

    const savedComment = await newComment.save()

    // Populate the comment with user information for the response
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('userId', 'username profilePicture')

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment: populatedComment
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    next(error)
  }
}

export const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params

    if (!postId) {
      return next(errorHandler(400, "Post ID is required"))
    }

    // Verify the post exists
    const Post = (await import('../models/post.model.js')).default
    const postExists = await Post.findById(postId)
    if (!postExists) {
      return next(errorHandler(404, "Post not found"))
    }

    const comments = await Comment.find({ postId })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: comments.length,
      comments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    next(error)
  }
}

export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId)

    if (!comment) {
      return next(errorHandler(404, "Comment not found"))
    }

    const userIndex = comment.likes.indexOf(req.user.id)

    if (userIndex === -1) {
      comment.numberOfLikes += 1
      comment.likes.push(req.user.id)
    } else {
      comment.numberOfLikes -= 1
      comment.likes.splice(userIndex, 1)
    }

    await comment.save()

    res.status(200).json(comment)
  } catch (error) {
    next(error)
  }
}

export const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId)

    if (!comment) {
      return next(errorHandler(404, "Comment not found"))
    }

    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not authorized to edit this comment!")
      )
    }

    const editedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content,
      },
      { new: true }
    )

    res.status(200).json(editedComment)
  } catch (error) {
    next(error)
  }
}

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId)

    if (!comment) {
      return next(errorHandler(404, "Comment not found"))
    }

    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not authorized to edit this comment!")
      )
    }

    await Comment.findByIdAndDelete(req.params.commentId)

    res.status(200).json("Comment has been deleted successfully!")
  } catch (error) {
    next(error)
  }
}

export const getComments = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      errorHandler(403, "You are not authorized to access this resource!")
    )
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0

    const limit = parseInt(req.query.limit) || 9

    const sortDirection = req.query.sort === "desc" ? -1 : 1

    const comments = await Comment.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit)

    const totalComments = await Comment.countDocuments()

    const now = new Date()

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    )

    const lastMonthComments = await Comment.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    })

    res.status(200).json({ comments, totalComments, lastMonthComments })
  } catch (error) {
    next(error)
  }
}
