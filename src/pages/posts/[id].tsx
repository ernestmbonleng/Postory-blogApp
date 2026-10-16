import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { getPublicPostDetail, toggleLike } from "@/src/services/post";
import { Post } from "@/src/types/posts";
import CommentSection from "@/src/component/CommentSection";
import { useAuth } from "@/src/hooks/useAuth";
import { Heart, MessageSquare, ArrowLeft } from "lucide-react";
import { api } from "@/src/services/post";
import Cookies from "js-cookie";
import ShareDropdown from "@/src/component/ShareDropdown";
import { useNotificationSocket } from '@/src/hooks/useNotificationSocket';

export default function PostDetailPage({
  initialPost,
}: {
  initialPost: Post | null;
}) {
  const router = useRouter();
  const { id } = router.query;
  const { token, userName, openAuthModal } = useAuth();
   
  const { 
    isConnected, 
    liveLikes, 
    joinPostRoom, 
    leavePostRoom,
    emitLike 
  } = useNotificationSocket();

  

  const [post, setPost] = useState<Post | null>(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [likeState, setLikeState] = useState({
    isLiked: initialPost?.isLikedByMe || false,
    count: initialPost?.likesCount || initialPost?.likes || 0
  });

  const hasIncrementedViews = useRef(false);
  const handleBack = () => router.push("/dashboard");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const displayTitle = post?.title || initialPost?.title || "Story";
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(
    displayTitle
  )}&author=${encodeURIComponent(post?.author?.displayName || "Wordoo Creator")}&image=${encodeURIComponent(post?.thumbnail || '')}`;
  const metaImage = post?.thumbnail || ogImageUrl;


    

  useEffect(() => {
    const postId = post?._id || post?.id;
    if (postId && isConnected) {
      joinPostRoom(postId);
    }

    return () => {
      if (postId) {
        leavePostRoom(postId);
      }
    };
  }, [post?._id, post?.id, isConnected]);

  // Sync live likes from socket
  useEffect(() => {
    const postId = post?._id || post?.id;
    if (postId && liveLikes[postId]) {
      setLikeState({
        isLiked: liveLikes[postId].isLiked,
        count: liveLikes[postId].count
      });
    }
  }, [liveLikes, post?._id, post?.id]);

  // Update handleLike to emit socket event
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const targetId = post?._id || post?.id;

    if (!targetId || !token) {
      openAuthModal();
      return;
    }

    const previousState = { ...likeState };

    setLikeState({
      isLiked: !previousState.isLiked,
      count: previousState.isLiked 
        ? Math.max(0, previousState.count - 1) 
        : previousState.count + 1
    });

    try {
      const result = await toggleLike(targetId);
      
      console.log("Like API response:", result);

      setLikeState({
        isLiked: result.liked,
        count: result.likes
      });

      // 👇 Emit socket event for real-time updates
      emitLike(targetId, result.liked, result.likes);

      if (result.liked) {
        Cookies.set(`liked_${targetId}`, "true", { expires: 7 });
      } else {
        Cookies.remove(`liked_${targetId}`);
      }
    } catch (err) {
      console.error("Like failed:", err);
      setLikeState(previousState);
    }
  };

  if (loading && !post) {
    return (
      <div className="p-20 text-center animate-pulse text-indigo-600 font-bold">
        Loading Story...
      </div>
    );
  }

  if (!post) {
    return <div className="p-20 text-center">Post not found.</div>;
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Head>
  <title>{post.title}</title>
  <meta property="og:title" content={post.title} />
  <meta
    property="og:description"
    content={post.excerpt || `Read ${post.title} on My Blog`}
  />

  <meta property="og:image" content={post.thumbnail || ogImageUrl} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="article" />
  <meta property="article:published_time" content={post.createdAt} />
  <meta property="article:author" content={post.author?.displayName || "Anonymous"} />
  
  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={post.title} />
  <meta name="twitter:description" content={post.excerpt || `Read ${post.title} on My Blog`} />
  <meta name="twitter:image" content={post.thumbnail || ogImageUrl} />
  
  {/* Fallback if no image */}
  {!post.thumbnail && (
    <meta property="og:image:alt" content={post.title} />
  )}
</Head>

      <nav className="fixed top-8 left-8 z-50 hidden lg:block">
        <button
          onClick={handleBack}
          className="group flex items-center justify-center w-12 h-12 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
          title="Back to Dashboard"
        >
          <ArrowLeft
            size={20}
            className="text-gray-400 group-hover:text-indigo-600 transition-colors group-hover:-translate-x-1 duration-300"
          />
        </button>
      </nav>

      <button
        onClick={handleBack}
        className="lg:hidden flex items-center gap-2 text-gray-400 mb-8 font-bold text-xs uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 py-6 border-y border-gray-100">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg uppercase overflow-hidden shrink-0">
            {post.author?.profilePicture ? (
              <img
                src={post.author.profilePicture}
                alt={`${post.author.displayName || "Author"}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              post.author?.displayName?.charAt(0) || "U"
            )}
          </div>
          <div>
            <div className="text-gray-900 font-semibold">
              {post.author?.displayName || "Anonymous"}
            </div>
            <div className="text-gray-500 text-sm">
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              · {Math.ceil(post.content?.length / 1000) || 1} min read
            </div>
          </div>
        </div>
      </header>

      {post.thumbnail && (
        <div className="mb-12">
          <img
            src={post.thumbnail}
            className="w-full h-[450px] object-cover rounded-[2rem] shadow-sm"
            alt={post.title}
          />
        </div>
      )}

      <article
        className="prose prose-lg prose-indigo max-w-none text-gray-800 leading-relaxed font-serif"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="sticky bottom-8 left-0 right-0 flex justify-center z-50 mt-12">
        <div className="flex items-center gap-6 bg-white/80 backdrop-blur-md border border-gray-200 px-6 py-3 rounded-full shadow-xl shadow-gray-200/50">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-all active:scale-90 ${
              likeState.isLiked ? "text-red-500" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Heart
              size={20}
              fill={likeState.isLiked ? "currentColor" : "none"}
              className={likeState.isLiked ? "animate-bounce" : ""}
            />
            <span className="text-sm font-bold">{likeState.count}</span>
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={() =>
              document
                .getElementById("discussion")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all"
          >
            <MessageSquare size={20} />
            <span className="text-sm font-bold">Discuss</span>
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <ShareDropdown
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title="Check out this post"
            description="Share this content"
          />
        </div>
      </div>

      <div id="discussion" className="mt-20">
        <CommentSection postId={post._id || post.id} token={token} />
      </div>
    </main>
  );
}

export async function getServerSideProps(context: any) {
  const { id } = context.query;
  try {
    const response = await getPublicPostDetail(id as string);
    return {
      props: {
        initialPost: response?.data || null,
      },
    };
  } catch (error) {
    console.error("SSR Fetch Error:", error);
    return {
      props: {
        initialPost: null,
      },
    };
  }
}
