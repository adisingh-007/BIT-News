import Advertise from "@/components/shared/Advertise"
import CommentSection from "@/components/shared/CommentSection"
import PostCard from "@/components/shared/PostCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { apiFetch } from "@/lib/api"

const PostDetails = () => {
  const { postSlug } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [post, setPost] = useState(null)
  const [recentArticles, setRecentArticles] = useState(null)

  console.log(recentArticles)

  // console.log(post)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!postSlug || postSlug === 'undefined') {
          setError(true)
          setLoading(false)
          return
        }

        setLoading(true)
        setError(false)

        const res = await apiFetch(`/api/post/getposts?slug=${postSlug}`)
        const data = await res.json()

        if (!res.ok) {
          setError(true)
          setLoading(false)
          return
        }

        if (res.ok) {
          if (data.posts && data.posts.length > 0) {
            setPost(data.posts[0])
            setError(false)
          } else {
            setError(true)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching post:', error)
        setError(true)
        setLoading(false)
      }
    }

    fetchPost()
  }, [postSlug])

  useEffect(() => {
    try {
      const fetchRecentPosts = async () => {
        const res = await fetch(`/api/post/getposts?limit=3`, {
          credentials: 'include'
        })

        const data = await res.json()

        if (res.ok) {
          setRecentArticles(data.posts)
        }
      }

      fetchRecentPosts()
    } catch (error) {
      console.log(error.message)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <img
          src="https://cdn-icons-png.flaticon.com/128/39/39979.png"
          alt="loading"
          className="w-20 animate-spin"
        />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col">
        <h1 className="text-3xl font-bold text-slate-700 mb-4">Post Not Found</h1>
        <p className="text-slate-500 mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/">
          <Button className="bg-slate-700">Go Back Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 text-center font-bold max-w-3xl mx-auto lg:text-4xl text-slate-700 underline">
        {post?.title || 'Loading...'}
      </h1>

      {post?.category && (
        <Link
          to={`/search?category=${post.category}`}
          className="self-center mt-5"
        >
          <Button variant="outline" className="border border-slate-500">
            {post.category}
          </Button>
        </Link>
      )}

      {post?.image && (
        <img
          src={post.image}
          alt={post.title || 'Article image'}
          className="mt-10 p-3 max-h-[500px] w-full object-cover"
        />
      )}

      {post && (
        <div className="flex justify-between p-3 mx-auto w-full max-w-2xl text-xs">
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span className="italic">
            {(post.content.length / 100).toFixed(0)} mins read
          </span>
        </div>
      )}

      <Separator className="bg-slate-500" />

      {post?.content && (
        <div
          className="p-3 max-w-3xl mx-auto w-full post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></div>
      )}

      <div className="max-w-4xl mx-auto w-full">
        <Advertise />
      </div>

      {post?._id && <CommentSection postId={post._id} />}

      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl font-semibold mt-5 text-slate-700">
          Recently published articles
        </h1>

        <div className="flex flex-wrap gap-5 my-5 justify-center">
          {recentArticles &&
            recentArticles.map((article) => (
              <PostCard key={article._id} post={article} />
            ))}
        </div>
      </div>
    </main>
  )
}

export default PostDetails
