import Advertise from "@/components/shared/Advertise"
import PostCard from "@/components/shared/PostCard"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { apiFetch } from "@/lib/api"

const Home = () => {
  const [posts, setPosts] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent posts from your DB
        const resPosts = await apiFetch("/api/post/getposts?limit=6")
        const dataPosts = await resPosts.json()
        if (resPosts.ok) setPosts(dataPosts.posts)

        // Fetch external news (top headlines)
        const resNews = await apiFetch("/api/news/top-headlines?category=Technology")
        const dataNews = await resNews.json()
        if (resNews.ok) setNews(dataNews.articles || [])
      } catch (err) {
        setError(`Network Error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>
  }

  return (
    <div>
      <div className="flex flex-col gap-6 p-28 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-800">
          Welcome to <span className="text-red-600"> Morning Dispatch</span>
        </h1>

        <p className="text-gray-600 mt-3 text-lg">
          Your trusted source for the latest headlines, in-depth analysis, and
          breaking news every morning.
        </p>

        <p className="text-gray-500 mt-1 italic">Stay informed, stay ahead.</p>

        <Link to={"/search?sort=desc&category=&searchTerm="}>
          <Button className="bg-yellow-400 hover:bg-yellow-600 text-black py-3 px-6 rounded-full font-semibold shadow-lg flex items-center gap-2 w-fit">
            View all posts <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <section className="pb-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-800">
            Why You'll Love Morning Dispatch
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title={"Diverse Content"}
              description={
                "Explore news on a variety of topics, from technology to lifestyle."
              }
              icon="📚"
            />

            <FeatureCard
              title={"Community Driven"}
              description={
                "Connect with writers and readers who share your interests."
              }
              icon="🌐"
            />

            <FeatureCard
              title={"Easy to Use"}
              description={
                "A seamless platform for sharing and discovering great content."
              }
              icon="🚀"
            />
          </div>
        </div>
      </section>

      <div className="p-3 bg-white">
        <Advertise />
      </div>

      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
        {posts && posts.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-slate-700">Recent Posts</h2>

            <div className="flex flex-wrap gap-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            <Link
              to={"/search?sort=desc&category=&searchTerm="}
              className="text-lg hover:underline text-center font-semibold"
            >
              View all news
            </Link>
          </div>
        )}

        {news && news.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-slate-700">Top Headlines</h2>
            <div className="flex flex-wrap gap-4">
              {news.slice(0,6).map((n) => (
                <a key={n._id} href={n.externalUrl} target="_blank" rel="noreferrer" className="bg-white hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px] border border-gray-400">
                  <div className="block h-[250px] w-full overflow-hidden">
                    <img src={n.image} alt={n.title} className="w-full h-full object-cover bg-gray-200" />
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    <p className="text-lg font-semibold line-clamp-2 text-slate-700">{n.title}</p>
                    <span className="italic text-[16px] text-slate-600">{n.category || 'News'}</span>
                    <span className="text-slate-700 border border-slate-500 text-center py-2 rounded-md mt-auto">Read Source</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

export default Home
