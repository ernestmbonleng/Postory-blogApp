"use client";
import React, { useState, useEffect } from 'react';
import { commentService } from '@/src/services/comment';
import { Comment } from '@/src/types/comment';
import { User, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/src/hooks/useAuth';
import { getToken } from '@/src/services/auth-storage'; 
import { useNotificationSocket } from '@/src/hooks/useNotificationSocket';

export default function CommentSection({ postId, token: initialToken }: { postId: string, token: string | null }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [replyText, setReplyText] = useState(''); // State for reply input
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { openAuthModal } = useAuth();
  
  const { liveComments } = useNotificationSocket();

  useEffect(() => {
    if (liveComments[postId]) {
      const newComments = liveComments[postId];
      setComments(prev => {
        // Avoid duplicates by checking IDs
        const existingIds = new Set(prev.map(c => c._id));
        const uniqueNewComments = newComments.filter((c: any) => !existingIds.has(c._id));
        return [...uniqueNewComments, ...prev];
      });
    }
  }, [liveComments, postId]);


  const getActiveToken = () => getToken() || initialToken;

  const [expandedComments, setExpandedComments] = useState<string[]>([]);

  // Toggle function for replies
  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev =>
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      try {
        const data = await commentService.getComments(postId);
        setComments(data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [postId]);

  const handlePost = async () => {
    const token = getActiveToken();
    if (!text.trim() || !token) {
      openAuthModal();
      return;
    }
    try {
      const newComment = await commentService.addComment(postId, text);
      setComments([newComment, ...comments]);
      setText('');
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

const handleLikeComment = async (commentId: string) => {
  const token = getActiveToken();
  if (!token) {
    openAuthModal();
    return;
  }

  const previousComments = [...comments];

  setComments(currentComments =>
    currentComments.map(c => {
      if (c._id === commentId) {
        const currentlyLiked = c.isLikedByMe;
        return {
          ...c,
          isLikedByMe: !currentlyLiked,
          likesCount: currentlyLiked 
            ? Math.max(0, (c.likesCount || 1) - 1) 
            : (c.likesCount || 0) + 1
        };
      }
      return c;
    })
  );

  try {
    const result = await commentService.toggleLikeComment(postId, commentId);
    
    setComments(currentComments =>
      currentComments.map(c =>
        c._id === commentId 
          ? { ...c, isLikedByMe: result.liked, likesCount: result.likes } 
          : c
      )
    );
  } catch (err) {
    setComments(previousComments);
    console.error("Like failed, rolling back state", err);
  }
};

  const [isSubmittingReply, setIsSubmittingReply] = useState(false);


  const handleReplySubmit = async (commentId: string) => {
    const token = getActiveToken();
    if (!replyText.trim() || !token || isSubmittingReply) return;

    setIsSubmittingReply(true);

    try {
      const newReply = await commentService.addReply(postId, commentId, replyText);

      setComments([newReply, ...comments]);

      setReplyText('');
      setReplyingTo(null);

      if (!expandedComments.includes(commentId)) {
        setExpandedComments((prev) => [...prev, commentId]);
      }
    } catch (err) {
      console.error("Reply failed", err);
    } finally {
      setIsSubmittingReply(false);
    }
  };
  return (
    <div className="mt-20 max-w-2xl mx-auto space-y-10 border-t border-gray-100 pt-16">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-serif font-medium text-gray-900 tracking-tight">
          Comments ({comments.length})
        </h3>
      </div>

      {getActiveToken() ? (
        <div className="flex gap-4 items-start bg-white p-4 rounded-xl border border-gray-100 shadow-sm focus-within:shadow-md transition-all">
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0 font-bold">
            <User size={18} strokeWidth={1.5} />
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 text-sm resize-none outline-none"
              placeholder="What are your thoughts?"
              rows={2}
            />
            <div className="flex justify-end">
              <button
                onClick={handlePost}
                disabled={!text.trim()}
                className="bg-black text-white px-5 py-2 rounded-full text-xs font-medium hover:bg-zinc-800 disabled:opacity-30 transition-all"
              >
                Respond
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={openAuthModal}
          className="flex gap-4 items-center bg-zinc-50 p-6 rounded-xl border border-zinc-100 cursor-pointer hover:bg-zinc-100/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
            <User size={18} strokeWidth={1} />
          </div>
          <p className="text-gray-500 text-sm font-medium italic group-hover:text-gray-900 transition-colors">
            Sign in to leave a response...
          </p>
        </div>
      )}

      {/* COMMENT FEED */}
      <div className="space-y-10">
        {comments.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No responses yet.</p>
        ) : (
          comments
            .filter((c) => !c.parentCommentId)
            .map((c) => {
              // Calculate replies for this specific comment
              const replies = comments.filter((reply) => reply.parentCommentId === c._id);
              const hasReplies = replies.length > 0;
              const isExpanded = expandedComments.includes(c._id);

              return (
                <div key={c._id} className="group">
                  <div className="flex gap-4">
                    <div className="w-9 h-9 bg-zinc-100 text-zinc-600 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
                      {c.authorName?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm hover:underline cursor-pointer">
                          {c.authorName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(c.createdAt), "MMM d")}
                        </span>
                      </div>
                      <p className="text-gray-700 text-[15px] leading-relaxed font-light">
                        {c.content}
                      </p>

                      <div className="pt-3 flex items-center gap-6">
                        <button
                          onClick={() => handleLikeComment(c._id)}
                          className={`flex items-center gap-1.5 transition-colors ${c.isLikedByMe ? "text-red-500" : "text-gray-400 hover:text-red-500"
                            }`}
                        >
                          <Heart
                            size={15}
                            strokeWidth={1.5}
                            fill={c.isLikedByMe ? "currentColor" : "none"}
                          />
                          <span className="text-[11px] font-medium">{c.likesCount || 0}</span>
                        </button>
                        <button
                          onClick={() => setReplyingTo(replyingTo === c._id ? null : c._id)}
                          className="text-[11px] font-medium text-gray-400 hover:text-gray-900"
                        >
                          Reply
                        </button>
                      </div>

                      {/* REPLY INPUT AREA */}
                      {replyingTo === c._id && (
                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-zinc-100">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-sm outline-none"
                            placeholder={`Reply to ${c.authorName}...`}
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="text-[10px] font-bold text-gray-400"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReplySubmit(c._id)}
                              disabled={!replyText.trim() || isSubmittingReply}
                              className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {isSubmittingReply ? (
                                <>
                                  <span className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  Sending...
                                </>
                              ) : (
                                "Send Reply"
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {hasReplies && (
                        <div className="mt-4">
                          {!isExpanded ? (
                            <button
                              onClick={() => toggleReplies(c._id)}
                              className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
                            >
                              <span className="w-6 h-[1px] bg-indigo-100"></span>
                              View {replies.length} {replies.length === 1 ? "reply" : "replies"}
                            </button>
                          ) : (
                            <div className="space-y-6">
                              <button
                                onClick={() => toggleReplies(c._id)}
                                className="flex items-center gap-2 text-[11px] font-bold text-gray-400 hover:text-gray-600 mb-2"
                              >
                                <span className="w-6 h-[1px] bg-gray-100"></span>
                                Hide replies
                              </button>

                              <div className="space-y-6 pl-10 border-l border-gray-50">
                                {replies.map((reply) => (
                                  <div key={reply._id} className="flex gap-3">
                                    <div className="w-7 h-7 bg-zinc-50 text-zinc-500 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0">
                                      {reply.authorName?.[0]}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-medium text-gray-900 text-xs">
                                          {reply.authorName}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                          {format(new Date(reply.createdAt), "MMM d")}
                                        </span>
                                      </div>
                                      <p className="text-gray-600 text-sm font-light leading-snug">
                                        {reply.content}
                                      </p>

                                      <div className="pt-2">
                                        <button
                                          onClick={() => handleLikeComment(reply._id)}
                                          className={`flex items-center gap-1.5 ${reply.isLikedByMe ? "text-red-500" : "text-gray-400"
                                            }`}
                                        >
                                          <Heart
                                            size={12}
                                            fill={reply.isLikedByMe ? "currentColor" : "none"}
                                          />
                                          <span className="text-[10px]">
                                            {reply.likesCount || 0}
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}