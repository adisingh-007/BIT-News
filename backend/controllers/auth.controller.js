import bcryptjs from "bcryptjs"
import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
import jwt from "jsonwebtoken"

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return next(errorHandler(400, "All fields are required"))
  }

  const hashedPassword = bcryptjs.hashSync(password, 10)

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  })

  try {
    await newUser.save()

    res.json("Signup successful")
  } catch (error) {
    next(error)
  }
}

export const signin = async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All fields are required"))
  }

  try {
    const validUser = await User.findOne({ email })

    if (!validUser) {
      return next(errorHandler(404, "User not found"))
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password)

    if (!validPassword) {
      return next(errorHandler(400, "Wrong Credentials"))
    }

    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET
    )

    const { password: pass, ...rest } = validUser._doc

    const isProd = process.env.NODE_ENV === 'production'
    const cookieOptions = {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    }

    res.status(200).cookie("access_token", token, cookieOptions).json(rest)
  } catch (error) {
    next(error)
  }
}

export const google = async (req, res, next) => {
  const { email, name, profilePhotoUrl } = req.body

  try {
    const user = await User.findOne({ email })

    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET
      )

      const { password: pass, ...rest } = user._doc

      const isProd = process.env.NODE_ENV === 'production'
      const cookieOptions = {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
      }

      return res
        .status(200)
        .cookie("access_token", token, cookieOptions)
        .json(rest)
    }

    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8)

    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10)

    const newUser = new User({
      username:
        name.toLowerCase().split(" ").join("") +
        Math.random().toString(9).slice(-4),
      email,
      password: hashedPassword,
      profilePicture: profilePhotoUrl,
    })

    await newUser.save()

    const token = jwt.sign(
      { id: newUser._id, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET
    )

    const { password: pass, ...rest } = newUser._doc

    const isProd = process.env.NODE_ENV === 'production'
    const cookieOptions = {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    }

    return res
      .status(200)
      .cookie("access_token", token, cookieOptions)
      .json(rest)
  } catch (error) {
    next(error)
  }
}

// Temporary endpoint to make a user admin
export const makeAdmin = async (req, res, next) => {
  const { email } = req.body

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { isAdmin: true },
      { new: true }
    )

    if (!user) {
      return next(errorHandler(404, "User not found"))
    }

    const { password, ...userWithoutPassword } = user._doc

    res.status(200).json({
      message: `User ${email} is now an admin`,
      user: userWithoutPassword
    })
  } catch (error) {
    next(error)
  }
}

// Debug endpoint to check user status
export const checkUserStatus = async (req, res, next) => {
  const { email } = req.query

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return next(errorHandler(404, "User not found"))
    }

    const { password, ...userWithoutPassword } = user._doc

    res.status(200).json({
      user: userWithoutPassword,
      isAdmin: user.isAdmin
    })
  } catch (error) {
    next(error)
  }
}

// Get admin dashboard statistics  
export const getAdminStats = async (req, res, next) => {
  try {
    // Import Post model at the top if not already imported
    const Post = (await import("../models/post.model.js")).default

    const totalUsers = await User.countDocuments()
    const totalPosts = await Post.countDocuments()
    
    // Get last month stats
    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    })
    
    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    })

    res.status(200).json({
      totalUsers,
      totalPosts,
      lastMonthUsers,
      lastMonthPosts,
      growth: {
        users: totalUsers > 0 ? ((lastMonthUsers / totalUsers) * 100).toFixed(1) : 0,
        posts: totalPosts > 0 ? ((lastMonthPosts / totalPosts) * 100).toFixed(1) : 0
      }
    })
  } catch (error) {
    next(error)
  }
}
