import mongoose from "mongoose"
import dotenv from "dotenv"
import Post from "./models/post.model.js"
import User from "./models/user.model.js"

dotenv.config()

const samplePosts = [
  {
    title: "Breaking: Major Technology Breakthrough in AI Research",
    content: `
      <h2>Revolutionary AI Development Announced</h2>
      <p>Scientists at leading research institutions have announced a groundbreaking development in artificial intelligence that could transform how we interact with technology. This breakthrough represents years of collaborative research and development.</p>
      
      <h3>Key Highlights:</h3>
      <ul>
        <li>Enhanced machine learning capabilities</li>
        <li>Improved natural language processing</li>
        <li>Better human-AI interaction models</li>
      </ul>
      
      <p>The implications of this research extend across multiple industries including healthcare, education, and autonomous systems. Experts believe this could accelerate the development of more intuitive and helpful AI assistants.</p>
      
      <blockquote>"This represents a significant leap forward in our understanding of artificial intelligence," said Dr. Sarah Chen, lead researcher on the project.</blockquote>
      
      <p>The research team plans to publish their findings in the upcoming issue of the Journal of AI Research, with implementation expected within the next two years.</p>
    `,
    category: "Technology",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop"
  },
  {
    title: "Global Climate Summit Reaches Historic Agreement",
    content: `
      <h2>World Leaders Unite for Climate Action</h2>
      <p>In a historic move, world leaders from 195 countries have reached a comprehensive agreement on climate action during the Global Climate Summit. This landmark deal sets ambitious targets for carbon reduction and renewable energy adoption.</p>
      
      <h3>Agreement Highlights:</h3>
      <ul>
        <li>50% reduction in global emissions by 2030</li>
        <li>$100 billion annual fund for developing countries</li>
        <li>Transition to 70% renewable energy by 2035</li>
        <li>Protection of 30% of global land and oceans</li>
      </ul>
      
      <p>The agreement comes after two weeks of intensive negotiations and represents the most ambitious climate commitment to date. Environmental groups have cautiously welcomed the deal while emphasizing the need for immediate implementation.</p>
      
      <p>Key provisions include mandatory reporting mechanisms, regular progress reviews, and financial penalties for countries failing to meet their commitments.</p>
    `,
    category: "Environment",
    image: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=400&fit=crop"
  },
  {
    title: "Revolutionary Medical Treatment Shows Promise in Clinical Trials",
    content: `
      <h2>Breakthrough in Cancer Treatment</h2>
      <p>A revolutionary new treatment for aggressive forms of cancer has shown remarkable results in Phase III clinical trials, offering new hope for patients with previously limited options.</p>
      
      <h3>Trial Results:</h3>
      <ul>
        <li>85% improvement in patient response rates</li>
        <li>Significantly reduced side effects</li>
        <li>Faster recovery times</li>
        <li>Better quality of life outcomes</li>
      </ul>
      
      <p>The treatment, developed over eight years of research, uses a novel approach that targets cancer cells while preserving healthy tissue. This precision medicine approach represents a major advancement in oncology.</p>
      
      <blockquote>"These results exceed our most optimistic projections," stated Dr. Michael Rodriguez, principal investigator.</blockquote>
      
      <p>If approved by regulatory authorities, the treatment could be available to patients within 18 months, potentially transforming cancer care worldwide.</p>
    `,
    category: "Health",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop"
  },
  {
    title: "Stock Markets Reach All-Time Highs Amid Economic Optimism",
    content: `
      <h2>Markets Surge on Positive Economic Indicators</h2>
      <p>Global stock markets reached record highs this week as investors responded positively to strong economic data and corporate earnings reports. The rally was driven by technology and healthcare sectors leading the charge.</p>
      
      <h3>Market Performance:</h3>
      <ul>
        <li>S&P 500 up 3.2% for the week</li>
        <li>NASDAQ gains 4.1%</li>
        <li>International markets showing similar trends</li>
        <li>Bond yields stabilizing</li>
      </ul>
      
      <p>Economists point to strong employment figures, rising consumer confidence, and robust corporate earnings as key drivers of the current market optimism. However, some analysts caution about potential volatility ahead.</p>
      
      <p>The Federal Reserve's recent policy statements have also contributed to market stability, with clear guidance on interest rate policies providing investor confidence.</p>
    `,
    category: "Business",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop"
  },
  {
    title: "Space Exploration Milestone: New Mars Mission Launches Successfully",
    content: `
      <h2>Historic Mars Mission Begins Journey</h2>
      <p>The latest Mars exploration mission launched successfully today, marking a significant milestone in space exploration. The mission carries advanced scientific instruments designed to search for signs of ancient life on Mars.</p>
      
      <h3>Mission Objectives:</h3>
      <ul>
        <li>Sample collection from Mars surface</li>
        <li>Analysis of Martian atmosphere</li>
        <li>Search for biosignatures</li>
        <li>Preparation for future human missions</li>
      </ul>
      
      <p>The spacecraft will travel approximately 300 million miles over the next seven months before reaching Mars. Upon arrival, it will deploy a sophisticated rover equipped with cutting-edge scientific instruments.</p>
      
      <blockquote>"This mission represents humanity's continued quest to understand our place in the universe," commented Mission Director Dr. Lisa Park.</blockquote>
      
      <p>The mission is expected to provide crucial data for planning future human missions to Mars, bringing us one step closer to becoming a multi-planetary species.</p>
    `,
    category: "Science",
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop"
  },
  {
    title: "Major Sports Championship Concludes with Thrilling Final",
    content: `
      <h2>Championship Final Delivers Historic Performance</h2>
      <p>The championship final concluded in spectacular fashion with a performance that will be remembered for years to come. Both teams displayed exceptional skill and determination in what many are calling the game of the century.</p>
      
      <h3>Game Highlights:</h3>
      <ul>
        <li>Record-breaking attendance figures</li>
        <li>Multiple championship records set</li>
        <li>Outstanding individual performances</li>
        <li>Dramatic overtime conclusion</li>
      </ul>
      
      <p>The winning team's comeback from a 20-point deficit in the final quarter will go down in sports history as one of the greatest comebacks ever witnessed. The victory caps off a remarkable season of outstanding competition.</p>
      
      <p>Fans from around the world watched as history was made, with social media buzzing with reactions and highlights from the incredible match.</p>
    `,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop"
  },
  {
    title: "Educational Revolution: New Learning Platform Transforms Online Education",
    content: `
      <h2>Innovation in Digital Learning</h2>
      <p>A groundbreaking educational platform has launched, promising to revolutionize how students learn online. The platform uses advanced AI and virtual reality to create immersive learning experiences that adapt to individual student needs.</p>
      
      <h3>Platform Features:</h3>
      <ul>
        <li>AI-powered personalized learning paths</li>
        <li>Virtual reality classroom experiences</li>
        <li>Real-time progress tracking</li>
        <li>Interactive collaboration tools</li>
      </ul>
      
      <p>Early adoption by several major universities has shown promising results, with students reporting higher engagement levels and improved learning outcomes. The platform addresses many of the challenges associated with traditional online education.</p>
      
      <blockquote>"This platform represents the future of education," said Dr. Amanda Foster, Dean of Digital Learning at State University.</blockquote>
      
      <p>The developers plan to expand the platform to K-12 education and corporate training programs, potentially transforming education across all levels.</p>
    `,
    category: "Education",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=400&fit=crop"
  },
  {
    title: "Entertainment Industry Embraces New Streaming Technology",
    content: `
      <h2>Next-Generation Streaming Revolution</h2>
      <p>The entertainment industry is experiencing a major shift with the introduction of revolutionary streaming technology that promises ultra-high definition content with minimal latency. Major studios and streaming platforms are rapidly adopting this new standard.</p>
      
      <h3>Technology Advantages:</h3>
      <ul>
        <li>8K resolution streaming capabilities</li>
        <li>Near-zero latency for live events</li>
        <li>Enhanced audio quality</li>
        <li>Lower bandwidth requirements</li>
      </ul>
      
      <p>This advancement comes at a time when consumer demand for high-quality streaming content is at an all-time high. The new technology promises to deliver cinema-quality experiences directly to viewers' homes.</p>
      
      <p>Industry analysts predict this could reshape the entertainment landscape, potentially reducing the gap between theatrical and home viewing experiences.</p>
    `,
    category: "Entertainment",
    image: "https://images.unsplash.com/photo-1489599856641-b39c078e5c0d?w=800&h=400&fit=crop"
  }
]

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Find admin user
    const adminUser = await User.findOne({ isAdmin: true })
    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.")
      process.exit(1)
    }

    console.log(`✅ Found admin user: ${adminUser.email}`)

    // Clear existing posts (optional) - COMMENTED OUT TO PREVENT DATA LOSS
    // await Post.deleteMany({})
    // console.log("🧹 Cleared existing posts")

    // Create posts with proper slugs
    const posts = samplePosts.map(post => ({
      ...post,
      userId: adminUser._id,
      slug: post.title
        .split(" ")
        .join("-")
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, "")
    }))

    // Avoid duplicates by checking existing titles/slugs
    const titles = posts.map(p => p.title)
    const slugs = posts.map(p => p.slug)
    const existing = await Post.find({
      $or: [
        { title: { $in: titles } },
        { slug: { $in: slugs } }
      ]
    }, 'title slug')

    const existingTitleSet = new Set(existing.map(e => e.title))
    const existingSlugSet = new Set(existing.map(e => e.slug))

    const newPosts = posts.filter(p => !existingTitleSet.has(p.title) && !existingSlugSet.has(p.slug))

    if (newPosts.length === 0) {
      console.log('ℹ️  No new posts to insert. Sample posts already exist.')
      mongoose.connection.close()
      process.exit(0)
    }

    // Insert only new posts; continue on any individual errors
    await Post.insertMany(newPosts, { ordered: false })
    console.log(`✅ Created ${newPosts.length} sample posts`)

    console.log("🎉 Database seeding completed successfully!")

    mongoose.connection.close()
    process.exit(0)

  } catch (error) {
    console.error("❌ Error seeding database:", error)
    mongoose.connection.close()
    process.exit(1)
  }
}

seedDatabase()