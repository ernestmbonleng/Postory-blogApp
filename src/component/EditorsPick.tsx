'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublicFeatured } from '@/src/services/post';

const EditorsPick = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicFeatured()
      .then(res => {
        setFeatured(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getImageUrl = (thumbnail: string | undefined): string => {
    if (!thumbnail || thumbnail.trim() === '') return 'https://via.placeholder.com/150';
    if (thumbnail.startsWith('http')) return thumbnail;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return thumbnail.startsWith('/') ? `${apiUrl}${thumbnail}` : `${apiUrl}/${thumbnail}`;
  };

  const getCategoryColor = (tag: string) => {
    const t = tag?.toLowerCase();
    if (t === 'travel') return 'bg-rose-100 text-rose-700';
    if (t === 'style') return 'bg-blue-100 text-blue-700';
    if (t === 'food') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading || featured.length === 0) return null;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Chosen by the editor</span>
        <h3 className="text-xl font-bold text-gray-900 mt-1">Editors Pick</h3>
      </div>
      
      <div className="space-y-6">
        {featured.slice(0, 3).map((post: any) => (
          <Link 
            key={post.id || post._id} 
            href={`/posts/${post.slug}`} 
            className="flex items-center gap-4 group"
          >

            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-md bg-gray-100">
              <img 
                src={getImageUrl(post.thumbnail)} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
            </div>

            <div className="flex-1">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getCategoryColor(post.tags?.[0])}`}>
                {post.tags?.[0] || 'Pick'}
              </span>
              <h5 className="font-bold text-sm text-gray-900 leading-snug mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h5>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EditorsPick;