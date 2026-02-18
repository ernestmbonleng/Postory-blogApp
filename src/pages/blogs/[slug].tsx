import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getPublicBlogBySlug,
  toggleSubscription,
  getSubscriptionStatus,
} from "@/src/services/blogs";
import Link from "next/link";
import {
  Bell,
  BellOff,
  Check,
  Share2,
  Loader2,
  Heart,
  MessageSquare,
  Search,
  X,
  ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { useDashboardSearch } from "@/src/component/search/DashboardSearchShadow";
import { SearchSuggestionsDropdown } from "@/src/component/search/SearchSuggestionsDropdown";
import { useAuth } from "@/src/hooks/useAuth";

// --- HELPERS ---
const getImageUrl = (thumbnail: string | undefined): string => {
  if (!thumbnail || thumbnail.trim() === "")
    return "https://via.placeholder.com/400x250?text=placeholder";
  if (thumbnail.startsWith("http")) return thumbnail;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return thumbnail.startsWith("/")
    ? `${apiUrl}${thumbnail}`
    : `${apiUrl}/${thumbnail}`;
};

// --- BRANDED THUMBNAIL COMPONENT ---
const PostThumbnail = ({ post }: { post: any }) => {
  const imageUrl = getImageUrl(post.thumbnail);
  const isPlaceholder = imageUrl.includes("placeholder.com");

  if (!isPlaceholder) {
    return (
      <img
        src={imageUrl}
        alt={post.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none pointer-events-none transition-transform duration-1000 group-hover:scale-110">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="text-4xl md:text-5xl font-black tracking-tighter opacity-30 leading-none"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.8)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            WORDOO
          </span>
        ))}
      </div>
      <div className="relative z-10">
        <ImageIcon className="text-white/40 mb-3 mx-auto" size={24} />
        <h4 className="text-white text-sm md:text-base font-bold leading-tight line-clamp-3 px-2">
          {post.title}
        </h4>
        <div className="mt-4 w-10 h-1 bg-white/30 mx-auto rounded-full" />
      </div>
    </div>
  );
};

export default function PublicBlogChannelView() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [activeTab, setActiveTab] = useState<"home" | "about">("home");
  const queryClient = useQueryClient();
  const { token, userId, userName } = useAuth();
const isAuthenticated = !!token; // Create the boolean helper right here
const user = { token, _id: userId, username: userName }; // Create a user object shim
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  const {
    data: blog,
    isLoading: blogLoading,
    error,
  } = useQuery({
    queryKey: ["public-blog", slug],
    queryFn: () => getPublicBlogBySlug(slug as string),
    enabled: !!slug,
    retry: false,
  });

  useQuery({
    queryKey: ["subscription-status", blog?._id, userId], // Use userId from useAuth directly
    queryFn: async () => {
      // Use token directly from useAuth destructuring
      if (!blog?._id || !isAuthenticated || !token) return null;
      const status = await getSubscriptionStatus(blog._id, token);
      
      setIsSubscribed(status.isSubscribed);
      setSubscriberCount(status.subscriberCount);
      return status;
    },
    enabled: !!blog?._id && isAuthenticated,
  });

  const {
    query,
    setQuery,
    results,
    isLoading: searchLoading,
    isActive: searchActive,
    clearSearch,
  } = useDashboardSearch();

  const handleSubscribe = async () => {
    if (!isAuthenticated || !user?.token) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
  
    if (!blog?._id) return;
  
    setSubLoading(true);
    try {
      // We pass the CURRENT state. The service uses this to decide POST vs DELETE.
      const result = await toggleSubscription(blog._id, user.token, isSubscribed);
      
      // ALWAYS use the data returned from the server to update your state
      queryClient.invalidateQueries({ 
        queryKey: ["subscription-status", blog._id, user._id] 
      });
    } catch (error) {
      console.error("Subscription failed:", error);
    } finally {
      setSubLoading(false);
    }
  };

  if (blogLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Blog Not Found</h2>
        <p className="text-gray-500 mt-2">
          The blog you are looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="mt-6 text-indigo-600 font-bold hover:underline"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const posts = (blog as any).posts || [];
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-[26px] font-black tracking-tight text-gray-900 flex items-center group">
              WORD
              <span className="relative flex items-center text-indigo-600 ml-0.5">
                oo
              </span>
            </span>
          </Link>

          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-100 overflow-hidden"></div>
          </div>
        </div>
      </nav>

      {/* HERO BANNER */}
      <div className="relative w-full h-[320px] md:h-[450px] bg-gray-100 overflow-hidden">
        <img
          src={
            blog.coverImage ||
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80"
          }
          className="w-full h-full object-cover"
          alt="Cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* PROFILE SECTION */}
        <div className="relative flex flex-col md:flex-row items-start gap-8 pb-10 border-b border-gray-100">
          <div className="relative -mt-24 z-20">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-white p-1.5 shadow-2xl overflow-hidden">
              <img
                src={
                  blog.profileImage ||
                  `https://ui-avatars.com/api/?name=${blog.title}&background=random`
                }
                className="w-full h-full object-cover rounded-full"
                alt="Profile"
              />
            </div>
          </div>

          <div className="flex-1 pt-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  {blog.title}
                  <Check
                    size={20}
                    className="bg-blue-500 text-white rounded-full p-1"
                  />
                </h1>
                <div className="flex items-center gap-4 mt-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
  {/* The Slug */}
  <span className="text-gray-900">@{blog.slug}</span>
  
  {/* Dot Separator */}
  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
  
  {/* The Nested Flex for Post Count */}
  <div className="flex items-center gap-1.5">
    <span className="text-gray-900">{posts.length}</span>
    <span>{posts.length === 1 ? 'post' : 'posts'}</span>
  </div>

  {/* Dot Separator */}
  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
  
  {/* The Nested Flex for Subscribers */}
  <div className="flex items-center gap-1.5">
    <span className="text-gray-900">{subscriberCount.toLocaleString()}</span>
    <span>{subscriberCount === 1 ? 'subscriber' : 'subscribers'}</span>
  </div>
</div>
                <p className="mt-5 text-gray-500 text-lg leading-relaxed font-light">
                  {blog.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleSubscribe}
                  disabled={subLoading}
                  className={`px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg flex items-center gap-2 ${
                    isSubscribed
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                      : "bg-black text-white hover:bg-zinc-800"
                  }`}
                >
                  {subLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : isSubscribed ? (
                    <BellOff size={18} />
                  ) : (
                    <Bell size={18} />
                  )}
                  {subLoading
                    ? "Processing..."
                    : isSubscribed
                    ? "Subscribed"
                    : "Subscribe"}
                </button>

                <button className="p-3.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-10 border-b border-gray-100">
          {["Home", "About"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase() as any)}
              className={`text-xs font-black py-6 border-b-2 transition-all tracking-[0.2em] uppercase ${
                activeTab === tab.toLowerCase()
                  ? "border-black text-black"
                  : "border-transparent text-gray-300 hover:text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* POSTS CONTENT */}
        <div className="py-12">
          {activeTab === "home" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((post: any) => (
                <Link
                  key={post._id}
                  href={`/posts/${post.slug || post._id}`}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden mb-5 bg-gray-50 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    {/* --- INTEGRATED BRANDED THUMBNAIL --- */}
                    <PostThumbnail post={post} />
                  </div>
                  <div className="space-y-3 px-2">
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
                      <span className="text-indigo-600 font-black">
                        Published
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-4 pt-2 text-gray-400">
                      <span className="flex items-center gap-1 text-xs font-bold">
                        <MessageSquare size={14} /> {post.views || 0}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold">
                        <Heart size={14} /> {post.likes || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl bg-gray-50 p-10 rounded-[3rem]">
              <h3 className="text-2xl font-bold mb-4">About this blog</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {blog.description ||
                  "This creator hasn't added an about section yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
