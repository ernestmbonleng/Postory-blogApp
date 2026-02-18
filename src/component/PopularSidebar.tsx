'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Post } from '@/src/types/posts';
import { getPublicPopular } from '@/src/services/post'; 
import { Heart } from 'lucide-react';

const PopularSidebar: React.FC = () => {
  const [popular, setPopular] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicPopular()
      .then((response) => {
        setPopular(response.data || []);
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  const getCategoryColor = (tag: string) => {
    const t = tag?.toLowerCase();
    if (t === 'coding') return 'bg-purple-100 text-purple-700';
    if (t === 'style') return 'bg-blue-100 text-blue-700';
    if (t === 'travel') return 'bg-rose-100 text-rose-700';
    if (t === 'culture') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) return <div className="p-6 text-gray-400 text-xs font-bold animate-pulse">Loading Popular...</div>;
  if (popular.length === 0) return null; 
  console.log('Popular posts:', popular);

  return (
    <aside className="space-y-8">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">What's hot</span>
        <h3 className="text-xl font-bold text-gray-900 mt-1">Most Popular</h3>
      </div>
      
      <div className="space-y-8">
        {popular.slice(0, 4).map((post, index) => (
          <div key={post._id} className="group">
            <div className="mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(post.categories?.[0] || 'General')}`}>
                {post.categories?.[0] || 'General'}
              </span>
            </div>
            
            <Link href={`/posts/${post.slug || post._id}`}>
              <h4 className="font-bold text-lg text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                {post.title}
              </h4>
            </Link>

            <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
              <span>{post.author?.displayName || 'Admin'}</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <Heart size={10} className="text-gray-400" /> {post.likes || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default PopularSidebar;