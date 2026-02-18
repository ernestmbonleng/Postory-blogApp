"use client";
import React, { useState, useEffect } from 'react';
import { commentService } from '@/src/services/comment';
import { Comment } from '@/src/types/comment';
import { User, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/src/hooks/useAuth'; 


export default function CommentSection({ postId, token }: { postId: string, token: string | null }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const { openAuthModal } = useAuth(); 

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

  return (
    <div className="mt-20 max-w-2xl mx-auto space-y-10 border-t border-gray-100 pt-16">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-serif font-medium text-gray-900 tracking-tight">
          Responses ({comments.length})
        </h3>
      </div>

      {token ? (
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
          <p className="text-center text-gray-400 text-sm py-10">No responses yet. Be the first to share your thoughts.</p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="group">
              <div className="flex gap-4">
                <div className="w-9 h-9 bg-zinc-100 text-zinc-600 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
                  {c.authorName?.[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm hover:underline cursor-pointer">{c.authorName}</span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(c.createdAt), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-gray-700 text-[15px] leading-relaxed font-light">{c.content}</p>
                  
                  <div className="pt-3 flex items-center gap-6">
                      <button 
                        onClick={openAuthModal}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                          <Heart size={15} strokeWidth={1.5} />
                          <span className="text-[11px] font-medium">0</span>
                      </button>
                      <button 
                        onClick={openAuthModal}
                        className="text-[11px] font-medium text-gray-400 hover:text-gray-900"
                      >
                        Reply
                      </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}