import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import Cookies from 'js-cookie';
import { toggleLike } from "@/src/services/post"; 

interface LikeButtonProps {
  post: any;
  token: string | null;
  openAuthModal: () => void;
}

const LikeButton = ({ post, token, openAuthModal }: LikeButtonProps) => {
  const [likesCount, setLikesCount] = useState<number>(post?.likes || post?.likesCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(post?.isLikedByMe || post?.isLikedByUser || false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const postId = post?._id || post?.id;
    const savedLike = Cookies.get(`liked_${postId}`);
    
    if (savedLike === 'true') {
      setIsLiked(true);
    } else {
      setIsLiked(post?.isLikedByMe || post?.isLikedByUser || false);
    }
    setLikesCount(post?.likes || post?.likesCount || 0);
  }, [post]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const targetId = post?._id || post?.id;

    if (!targetId || !token) {
      openAuthModal();
      return;
    }

    if (isLoading) return;
    
    setIsLoading(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Store previous state for rollback
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    // Optimistic update
    setIsLiked(!previousIsLiked);
    setLikesCount(prev => previousIsLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      // Use the imported toggleLike function
      const result = await toggleLike(targetId);
      
      setLikesCount(result.likes);
      setIsLiked(result.liked);

      if (result.liked) {
        Cookies.set(`liked_${targetId}`, 'true', { expires: 7 });
      } else {
        Cookies.remove(`liked_${targetId}`);
      }
    } catch (err) {
      console.error('Like failed:', err);
      // Rollback on error
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-1.5 group/like transition-all active:scale-90 ${
        isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-900'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart
        size={18}
        fill={isLiked ? 'currentColor' : 'none'}
        className={`${isLiked ? '' : 'group-hover/like:text-red-400'} ${
          isAnimating ? 'animate-ping' : ''
        }`}
      />
      <span className={`text-xs font-bold ${isLiked ? 'text-gray-900' : 'text-gray-500'}`}>
        {likesCount}
      </span>
    </button>
  );
};

export default LikeButton;