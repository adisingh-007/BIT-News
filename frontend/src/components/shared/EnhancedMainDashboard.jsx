import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { convertToReadableFormat } from "@/lib/utils"
import { Button } from "../ui/button"
import { Link } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { TrendingUp, TrendingDown, Users, FileText, MessageSquare, Eye } from "lucide-react"

const EnhancedMainDashboard = () => {
  const [users, setUsers] = useState([])
  const [comments, setComments] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalComments, setTotalComments] = useState(0)
  const [lastMonthUsers, setLastMonthUsers] = useState(0)
  const [lastMonthPosts, setLastMonthPosts] = useState(0)
  const [lastMonthComments, setLastMonthComments] = useState(0)

  const { currentUser } = useSelector((state) => state.user)

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.isAdmin) return
      
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [usersRes, postsRes, commentsRes] = await Promise.all([
          fetch("/api/user/getusers?limit=5"),
          fetch("/api/post/getposts?limit=5"),
          fetch("/api/comment/getcomments?limit=5")
        ])

        const [usersData, postsData, commentsData] = await Promise.all([
          usersRes.json(),
          postsRes.json(),
          commentsRes.json()
        ])

        if (usersRes.ok) {
          setUsers(usersData.users || [])
          setTotalUsers(usersData.totalUsers || 0)
          setLastMonthUsers(usersData.lastMonthUsers || 0)
        }

        if (postsRes.ok) {
          setPosts(postsData.posts || [])
          setTotalPosts(postsData.totalPosts || 0)
          setLastMonthPosts(postsData.lastMonthPosts || 0)
        }

        if (commentsRes.ok) {
          setComments(commentsData.comments || [])
          setTotalComments(commentsData.totalComments || 0)
          setLastMonthComments(commentsData.lastMonthComments || 0)
        }

      } catch (error) {
        console.log("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentUser])

  if (loading) {
    return (
      <div className="p-3 md:mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
          )}
          {change}% from last month
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 md:mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome back, {currentUser?.username}!</p>
        </div>
        <div className="flex gap-2">
          <Link to="/create-post">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          change={totalUsers > 0 ? ((lastMonthUsers / totalUsers) * 100).toFixed(1) : 0}
          icon={Users}
          trend={lastMonthUsers > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Total Posts"
          value={totalPosts}
          change={totalPosts > 0 ? ((lastMonthPosts / totalPosts) * 100).toFixed(1) : 0}
          icon={FileText}
          trend={lastMonthPosts > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Total Comments"
          value={totalComments}
          change={(lastMonthComments / Math.max(totalComments, 1) * 100).toFixed(1)}
          icon={MessageSquare}
          trend={lastMonthComments > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Monthly Growth"
          value={Math.round((lastMonthUsers + lastMonthPosts + lastMonthComments) / 3)}
          change="12.5"
          icon={Eye}
          trend="up"
        />
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
            <Link to="/dashboard?tab=users">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="flex items-center space-x-3">
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  {user.isAdmin && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Posts</CardTitle>
            <Link to="/dashboard?tab=posts">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post._id} className="flex items-start space-x-3">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {post.category} • {convertToReadableFormat(post.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Comments</CardTitle>
            <Link to="/dashboard?tab=comments">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="border-l-2 border-gray-200 pl-3">
                  <p className="text-sm text-gray-900 line-clamp-2">
                    {comment.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {comment.numberOfLikes} likes • {convertToReadableFormat(comment.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/create-post">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <FileText className="h-6 w-6 mb-2" />
                Create Post
              </Button>
            </Link>
            <Link to="/dashboard?tab=users">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <Users className="h-6 w-6 mb-2" />
                Manage Users
              </Button>
            </Link>
            <Link to="/dashboard?tab=comments">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <MessageSquare className="h-6 w-6 mb-2" />
                Moderate Comments
              </Button>
            </Link>
            <Link to="/dashboard?tab=posts">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <Eye className="h-6 w-6 mb-2" />
                View All Posts
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedMainDashboard