import mongoose from "mongoose"
import bcryptjs from "bcryptjs"
import dotenv from "dotenv"
import User from "./models/user.model.js"

dotenv.config()

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Delete existing user if exists
    await User.deleteOne({ email: "adisingh1040@gmail.com" })
    console.log("🧹 Cleared existing user")

    // Create new admin user
    const hashedPassword = bcryptjs.hashSync("admin@1234", 10)
    
    const adminUser = new User({
      username: "admin@1234",
      email: "admin@gmail.com",
      password: hashedPassword,
      isAdmin: true,
      profilePicture: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"
    })

    await adminUser.save()
    console.log("✅ Admin user created successfully!")
    console.log("📧 Email: adisingh1040@gmail.com")
    console.log("🔑 Password: Adisingh@1590")
    console.log("👑 Admin Status: true")

    mongoose.connection.close()
    console.log("Database connection closed")
    process.exit(0)

  } catch (error) {
    console.error("❌ Error creating admin user:", error)
    mongoose.connection.close()
    process.exit(1)
  }
}

createAdminUser()