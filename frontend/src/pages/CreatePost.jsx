import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getFilePreview, uploadFile } from "@/lib/appwrite/uploadImage"
import React, { useState, lazy, Suspense } from "react"

// Lazy load ReactQuill to avoid compatibility issues
const ReactQuill = lazy(() => import('react-quill'))

// Import Quill styles
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom"
import { apiFetch } from "@/lib/api"

const CreatePost = () => {
  const { toast } = useToast()
  const navigate = useNavigate()

  const [file, setFile] = useState(null)
  const [imageUploadError, setImageUploadError] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)

  const [formData, setFormData] = useState({})
  // console.log(formData)

  const [createPostError, setCreatePostError] = useState(null)

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image!")
        toast({ title: "Please select an image!" })
        return
      }

      setImageUploading(true)
      setImageUploadError(null)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('image', file)

      // Upload to local backend instead of Appwrite
      const response = await apiFetch('/api/post/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      // Update form data with the image URL
      setFormData(prevData => ({ ...prevData, image: data.imageUrl }))

      toast({ title: "Image Uploaded Successfully!" })
      setImageUploading(false)

    } catch (error) {
      setImageUploadError("Image upload failed")
      console.log("Upload error:", error)
      toast({ title: "Image upload failed!" })
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await apiFetch("/api/post/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      console.log('Create post response:', data) // Debug log

      if (!res.ok) {
        toast({ title: "Something went wrong! Please try again." })
        setCreatePostError(data.message)

        return
      }

      if (res.ok) {
        toast({ title: "Article Published Successfully!" })
        setCreatePostError(null)

        // Handle both old and new response structures
        const slug = data.post?.slug || data.slug
        if (slug) {
          navigate(`/post/${slug}`)
        } else {
          console.error('No slug found in response:', data)
          // Fallback navigation
          navigate('/dashboard?tab=posts')
        }
      }
    } catch (error) {
      toast({ title: "Something went wrong! Please try again." })
      setCreatePostError("Something went wrong! Please try again.")
    }
  }

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold text-slate-700">
        Create a post
      </h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <Input
            type="text"
            placeholder="Title"
            required
            id="title"
            className="w-full sm:w-3/4 h-12 border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger className="w-full sm:w-1/4 h-12 border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0">
              <SelectValue placeholder="Select a Category" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Environment">Environment</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4 items-center justify-between border-4 border-slate-600 border-dotted p-3">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <Button
            type="button"
            className="bg-slate-700"
            onClick={handleUploadImage}
          >
            {imageUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>

        {imageUploadError && <p className="text-red-600">{imageUploadError}</p>}

        {formData.image && (
          <img
            src={formData.image}
            alt="upload"
            className="w-full h-72 object-cover"
          />
        )}

        <Suspense fallback={<div>Loading editor...</div>}>
          <ReactQuill
            theme="snow"
            placeholder="Write something here..."
            className="h-72  mb-12"
            required
            onChange={(value) => {
              setFormData({ ...formData, content: value })
            }}
          />
        </Suspense>

        <Button
          type="submit"
          className="h-12 bg-green-600 font-semibold max-sm:mt-5 text-md"
        >
          Publish Your Article
        </Button>

        {createPostError && (
          <p className="text-red-600 mt-5">{createPostError}</p>
        )}
      </form>
    </div>
  )
}

export default CreatePost
