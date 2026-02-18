import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { getMyBlog, uploadBlogImage, updateMyBlogImages } from '@/src/services/blogs';
import { getUserPosts, updatePost, deletePost } from '@/src/services/post';
import { useAuth } from '@/src/hooks/useAuth';
import Link from 'next/link';
import { 
  Bell, Check, PlusCircle, Camera, Share2, Settings, 
  Heart, MessageSquare, MoreVertical, Edit, Trash2, Download, 
  Clock, Archive, Search, X, ImageIcon 
} from 'lucide-react';
import { format } from 'date-fns';
import PostActionsDropdown from '@/src/component/PostActionsDropdown';
import { useDashboardSearch } from '@/src/component/search/DashboardSearchShadow';
import { SearchSuggestionsDropdown } from '@/src/component/search/SearchSuggestionsDropdown';

// --- ADDED HELPERS & SUB-COMPONENT ---
const getImageUrl = (thumbnail: string | undefined): string => {
  if (!thumbnail || thumbnail.trim() === '') return 'https://via.placeholder.com/400x250?text=placeholder';
  if (thumbnail.startsWith('http')) return thumbnail;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return thumbnail.startsWith('/') ? `${apiUrl}${thumbnail}` : `${apiUrl}/${thumbnail}`;
};

const PostThumbnail = ({ post, isDraft, isArchived }: { post: any, isDraft?: boolean, isArchived?: boolean }) => {
  const imageUrl = getImageUrl(post.thumbnail);
  const isPlaceholder = imageUrl.includes('placeholder.com');

  if (!isPlaceholder) {
    return (
      <img
        src={imageUrl}
        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isDraft || isArchived ? 'opacity-70 grayscale-[30%]' : ''}`}
        alt={post.title}
      />
    );
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group/thumb ${isDraft || isArchived ? 'opacity-70 grayscale-[30%]' : ''}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none pointer-events-none transition-transform duration-1000 group-hover:scale-110">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="text-4xl md:text-5xl font-black tracking-tighter opacity-30 leading-none"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1px rgba(255,255,255,0.8)',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            WORDOO
          </span>
        ))}
      </div>
      <div className="relative z-10">
        <ImageIcon className="text-white/40 mb-3 mx-auto" size={24} />
        <h4 className="text-white text-sm md:text-base font-bold leading-tight line-clamp-3 px-2">
          {post.title || "Untitled Draft"}
        </h4>
        <div className="mt-4 w-10 h-1 bg-white/30 mx-auto rounded-full" />
      </div>
    </div>
  );
};

export default function BlogChannelView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, userName, userId } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'about'>('home');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const {
    query,
    setQuery,
    results,
    isLoading: searchLoading,
    error: searchError,
    isActive: searchActive,
    clearSearch,
  } = useDashboardSearch();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: blog, isLoading: blogLoading } = useQuery({
    queryKey: ['my-blog'],
    queryFn: async () => (token ? await getMyBlog(token) : null),
    enabled: !!token,
    retry: false,
  });

  const handleSelectResult = (result: any) => {
    switch (result.type) {
      case 'user':
        router.push(`/profile/${result.data.username}`);
        break;
      case 'post':
        router.push(`/posts/${result.data.slug || result.data.id}`);
        break;
      case 'tag':
        router.push(`/tags/${result.text}`);
        break;
      case 'category':
        router.push(`/category/${result.text}`);
        break;
    }
    clearSearch();
  };

  const { data: postsResponse, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', token],
    queryFn: async () => (token ? await getUserPosts(token) : null),
    enabled: !!token && !!blog,
    retry: false,
  });

  const handleImageUpload = async (file: File, type: 'coverImage' | 'profileImage') => {
    if (!token) return;
    setUploading(true);
    try {
      const previewURL = URL.createObjectURL(file);
      if (type === 'coverImage') setCoverPreview(previewURL);
      else setProfilePreview(previewURL);
      const uploaded = await uploadBlogImage(file, token);
      await updateMyBlogImages({ [type]: uploaded.url }, token);
      queryClient.invalidateQueries({ queryKey: ['my-blog'] });
    } catch (err) {
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!token) return;
    const confirmed = window.confirm(
      'You are about to delete this post. It will be kept in trash for 30 days before permanent deletion.'
    );
    if (!confirmed) return;
    try {
      const res = await deletePost(postId, token);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['user-posts', token] });
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleToggleVisibility = async (postId: string, currentStatus: string, postTitle: string) => {
    if (!token) return;
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await updatePost(postId, { status: newStatus }, token);
      queryClient.invalidateQueries({ queryKey: ['user-posts', token] });
      alert(`Post ${newStatus === 'published' ? 'published' : 'moved to drafts'}\n\n"${postTitle}" is now ${newStatus}.`);
    } catch (error) {
      alert('Failed to update post status.');
    }
  };

  const handleDownload = (post: any) => {
    const postData = {
      title: post.title,
      content: post.content,
      author: post.author?.name || 'Unknown',
      url: `${window.location.origin}/posts/${post.slug || post._id}`
    };
    const blob = new Blob([JSON.stringify(postData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.title?.replace(/\s+/g, '-') || 'post'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = (postId: string, postSlug?: string, postTitle?: string) => {
    const postUrl = `${window.location.origin}/posts/${postSlug || postId}`;
    navigator.clipboard.writeText(postUrl)
      .then(() => alert('Link copied to clipboard!'))
      .catch(() => alert('Failed to copy link.'));
  };

  const handleEditPost = (postId: string) => {
    router.push(`/dashboard/edit-post/${postId}`);
  };

  if (blogLoading || postsLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const posts = postsResponse?.data || []; 

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-[26px] font-black tracking-tight text-gray-900 flex items-center group">
              WORD<span className="relative flex items-center text-indigo-600 ml-0.5">oo</span>
            </span>
          </Link>
          
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, posts, tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {query && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <SearchSuggestionsDropdown
              visible={searchActive}
              loading={searchLoading}
              results={results}
              error={searchError}
              onSelect={handleSelectResult}
              query={query}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-100 overflow-hidden"></div>
          </div>
        </div>
      </nav>

      <div className="relative w-full h-[320px] md:h-[450px] bg-gray-100 overflow-hidden group cursor-pointer" onClick={() => coverInputRef.current?.click()}>
        <img src={coverPreview || blog?.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={30} />
        </div>
        <input ref={coverInputRef} type="file" hidden onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'coverImage')} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="relative flex flex-col md:flex-row items-start gap-8 pb-10 border-b border-gray-100">
          <div className="relative -mt-24 z-20">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-white p-1.5 shadow-2xl overflow-hidden cursor-pointer group" onClick={() => profileInputRef.current?.click()}>
              <img src={profilePreview || blog?.profileImage || `https://ui-avatars.com/api/?name=${blog?.title}&background=random`} className="w-full h-full object-cover rounded-full" alt="Profile" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <input ref={profileInputRef} type="file" hidden onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'profileImage')} />
          </div>

          <div className="flex-1 pt-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  {blog?.title}
                  <Check size={20} className="bg-blue-500 text-white rounded-full p-1" />
                </h1>
                <div className="flex items-center gap-4 mt-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
                  <span className="text-gray-900">@{blog?.slug}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{posts.length} Posts</span>
                </div>
                <p className="mt-5 text-gray-500 text-lg leading-relaxed font-light">
                  {blog?.description || "Curating the finest insights and stories for the modern reader."}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button className="bg-black text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg flex items-center gap-2">
                  <Bell size={18} /> Subscribe
                </button>
                <button className="p-3.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"><Share2 size={20} /></button>
                <button className="p-3.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"><Settings size={20} /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-10">
            {['Home', 'About'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase() as any)}
                className={`text-xs font-black py-6 border-b-2 transition-all tracking-[0.2em] uppercase ${activeTab === tab.toLowerCase() ? 'border-black text-black' : 'border-transparent text-gray-300 hover:text-gray-500'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Link href="/dashboard/create-post" className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100">
            <PlusCircle size={16} /> New Post
          </Link>
        </div>

        <div className="py-12">
          {activeTab === 'home' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((post: any) => {
                const isDraft = post.status?.toLowerCase() === 'draft';
                const isArchived = post.status?.toLowerCase() === 'archived';
                const destination = isDraft ? `/dashboard/edit-post/${post._id}` : `/posts/${post.slug || post._id}`;
                const isOwner = !!userName && (post.author?.username === userName || blog?.authorName === userName);

                return (
                  <article key={post._id} className="group flex flex-col cursor-pointer relative">
                    {deletingPostId === post._id && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center rounded-[2rem]">
                        <div className="text-center">
                          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-sm font-bold text-gray-700">Moving to trash...</p>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
                      <PostActionsDropdown
                        postId={post._id}
                        isOwner={isOwner}
                        currentStatus={post.status}
                        onEdit={() => handleEditPost(post._id)}
                        onDelete={() => handleDeletePost(post._id)}
                        onToggleVisibility={() => handleToggleVisibility(post._id, post.status, post.title)}
                        onDownload={() => handleDownload(post)}
                        onCopyLink={() => handleCopyLink(post._id, post.slug, post.title)}
                      />
                    </div>

                    <div onClick={() => !isArchived && router.push(destination)}>
                      <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden mb-5 bg-gray-50 shadow-sm group-hover:shadow-xl transition-all duration-500">
                        {isDraft && !isArchived && (
                          <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Draft</div>
                        )}
                        
                        {/* --- USING THE NEW THUMBNAIL COMPONENT --- */}
                        <PostThumbnail post={post} isDraft={isDraft} isArchived={isArchived} />

                        {isArchived && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="text-center text-white p-4">
                              <Clock size={24} className="mx-auto mb-2" />
                              <p className="text-xs font-bold uppercase tracking-widest">In Trash</p>
                            </div>
                          </div>
                        )}

                        {isDraft && !isArchived && (
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white text-black text-xs font-black px-5 py-2 rounded-full uppercase tracking-tighter shadow-xl">Continue Editing</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 px-2">
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
                          <span className={`${isDraft ? 'text-amber-500' : isArchived ? 'text-gray-500' : 'text-indigo-600'} font-black`}>{post.status}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                          {post.title || "Untitled Draft"}
                        </h4>
                        {!isDraft && !isArchived && (
                          <div className="flex items-center gap-4 pt-2 text-gray-400">
                            <span className="flex items-center gap-1 text-xs font-bold"><MessageSquare size={14} /> {post.views || 0}</span>
                            <span className="flex items-center gap-1 text-xs font-bold"><Heart size={14} /> {post.likes || 0}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}