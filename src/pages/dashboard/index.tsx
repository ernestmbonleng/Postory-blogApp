import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getToken } from '@/src/services/auth-storage';
import { getMyBlog } from '@/src/services/blogs';
import { getTenantPublicPosts } from '@/src/services/post';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/component/DashboardLayout';
import { Post } from '@/src/types/posts';
import PopularSidebar from '@/src/component/PopularSidebar';
import EditorsPick from '@/src/component/EditorsPick';
import Link from 'next/link';
import { Heart, MessageSquare, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const PostThumbnail = ({ post, getImageUrl }: { post: any, getImageUrl: Function }) => {
  const imageUrl = getImageUrl(post.thumbnail);
  const isPlaceholder = imageUrl.includes('placeholder.com');

  if (!isPlaceholder) {
    return (
      <img
        src={imageUrl}
        alt={post.title}
        className="w-full h-full object-cover md:transform md:group-hover:scale-105 md:transition-transform md:duration-700"
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none pointer-events-none transition-transform duration-1000 group-hover/thumb:scale-110">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="text-6xl md:text-7xl font-black tracking-tighter opacity-30 leading-none"
            style={{
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255,255,255,0.8)',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            WORDOO
          </span>
        ))}
      </div>
      <div className="relative z-10">
        <ImageIcon className="text-white/40 mb-3 mx-auto" size={32} />
        <h4 className="text-white text-lg md:text-xl font-bold leading-tight line-clamp-3 px-2">
          {post.title}
        </h4>
        <div className="mt-4 w-12 h-1 bg-white/30 mx-auto rounded-full" />
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  // PAGINATION STATE
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const t = getToken();
    setToken(t || null);
  }, []);

  // Reset scroll on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);


  const categories = [
    { name: 'Fashion', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=100&q=80', color: 'bg-pink-50' },
    { name: 'Food', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=100&q=80', color: 'bg-green-50' },
    { name: 'Coding', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=100&q=80', color: 'bg-purple-50' },
    { name: 'Style', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=100&q=80', color: 'bg-blue-50' },
    { name: 'Travel', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=100&q=80', color: 'bg-rose-50' },
    { name: 'Culture', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80', color: 'bg-orange-50' },
  ];

  const { isLoading: myBlogLoading } = useQuery({
    queryKey: ['my-blog'],
    queryFn: () => getMyBlog(token as string),
    enabled: !!token,
  });
// have to remove it causes re-rending all the time
const { data: postsData, isLoading: postsLoading, isFetching } = useQuery({
  queryKey: ['public-posts', page],
  queryFn: () => getTenantPublicPosts({ limit: limit, page: page }),
  refetchOnWindowFocus: false,  
  staleTime: 5 * 60 * 1000,    
  cacheTime: 10 * 60 * 1000,
  keepPreviousData: true,   
});

//
  const posts: Post[] = postsData?.data?.posts || [];
  const hasMore = posts.length === limit;

  const getImageUrl = (thumbnail: string | undefined): string => {
    if (!thumbnail || thumbnail.trim() === '') return 'https://via.placeholder.com/400x250?text=placeholder';
    if (thumbnail.startsWith('http')) return thumbnail;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return thumbnail.startsWith('/') ? `${apiUrl}${thumbnail}` : `${apiUrl}/${thumbnail}`;
  };

  const getCategoryColor = (categories: string) => {
    const t = categories?.toLowerCase();
    if (t === 'coding') return 'bg-purple-100 text-purple-700';
    if (t === 'style') return 'bg-blue-100 text-blue-700';
    if (t === 'travel') return 'bg-rose-100 text-rose-700';
    if (t === 'culture') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (postsLoading || isFetching) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-sm font-medium text-gray-500">Loading stories...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Categories Section */}
        <section className="w-full overflow-x-auto pb-4">
          <div className="flex md:grid md:grid-cols-6 gap-5 min-w-max md:min-w-full">
            {categories.map((cat) => (
              <button key={cat.name} className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:-translate-y-1 hover:shadow-md ${cat.color}`}>
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-12">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-3xl font-bold text-gray-900">Recent Posts</h2>
            </div>

            <div className="space-y-16">
              {posts.length > 0 ? (
                posts.map((post: any) => {

                  return (
                    <article key={post._id} className="flex flex-col md:flex-row gap-8 group border-b border-gray-100 pb-6 md:border-none md:pb-0">
                      <Link
                        href={`${post.slug || post._id}`}
                        className="w-full md:w-[45%] aspect-[16/10] md:rounded-2xl md:overflow-hidden md:shadow-sm shrink-0 bg-gray-100"
                      >
                        <PostThumbnail post={post} getImageUrl={getImageUrl} />
                      </Link>

                      <div className="flex-1 py-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-4">
                            {post.categories?.slice(0, 3).map((categories: string, index: number) => (
                              <span
                                key={index}
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryColor(categories)}`}
                              >
                                {categories}
                              </span>
                            ))}
                            <span className="text-xs text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <Link href={`/posts/${post.slug || post._id}`}>
  <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight md:group-hover:text-indigo-600 transition-colors">
    {post.title}
  </h3>
</Link>
                          
<p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
  {post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '')}
</p>
</div>

<div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shrink-0">
      {post.blog?.profileImage ? (
        <img src={post.blog.profileImage} alt="" className="w-full h-full object-cover" />
      ) : (
        <span>{(post.blog?.authorName || "U").charAt(0)}</span>
      )}
    </div>
    
    <div className="flex flex-col">
    
      
      <Link 
        href={`/blogs/${post.blog?.slug || 'no-slug-found'}`}
        className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors leading-none"
      >
        {post.blog?.title || 'Untitled Blog'}
      </Link>
      <span className="text-[10px] text-gray-500 font-medium mt-1">
        by {post.blog?.authorName || post.blog?.name || `Anonymous`}
      </span>
    </div>
  </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5" title="Likes">
                              <Heart size={16} fill={post.likes > 0 ? "currentColor" : "none"} className={post.likes > 0 ? "text-red-500" : "text-gray-400"} />
                              <span className="text-xs font-medium">{post.likes || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Comments">
                              <MessageSquare size={16} className="text-gray-400" />
                              <span className="text-xs font-medium">{post.commentsCount || 0}</span>
                            </div>
                            <span className="text-gray-300 hidden md:inline">|</span>
                            <Link href={`/posts/${post.slug || post._id}`} className="text-sm font-semibold text-gray-900 md:hover:text-indigo-600 transition-colors">
                              Read Article
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">No posts found on this page.</p>
                  <button onClick={() => setPage(1)} className="mt-4 text-indigo-600 font-bold text-sm">Return to first page</button>
                </div>
              )}

              {/* PAGINATION CONTROLS */}
              <div className="flex items-center justify-between pt-10 border-t border-gray-100">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                >
                  <ChevronLeft size={18} /> Previous
                </button>

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-200">
                    {page}
                  </span>
                </div>

                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div className="sticky top-6 space-y-12">
              <PopularSidebar />
              <EditorsPick />
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="font-bold text-gray-900 mb-2">Weekly Newsletter</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">Get the latest stories and insights delivered straight to your inbox.</p>
                <input type="email" placeholder="Email address" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-2 focus:ring-1 focus:ring-indigo-500 outline-none" />
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}