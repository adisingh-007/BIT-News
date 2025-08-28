import express from "express"
import { verifyToken } from "../utils/verifyUser.js"
import {
  create,
  deletepost,
  getPosts,
  updatepost,
} from "../controllers/post.controller.js"
import { uploadImage } from "../controllers/image.controller.js"

const router = express.Router()

router.post("/create", verifyToken, create)
router.get("/getposts", getPosts)
router.delete("/deletepost/:postId/:userId", verifyToken, deletepost)
router.put("/updatepost/:postId/:userId", verifyToken, updatepost)

// Image upload route
router.post("/upload-image", verifyToken, uploadImage)

export default router