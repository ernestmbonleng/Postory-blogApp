import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

export default function PreviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('wordoo_preview_data');
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">No preview data found. Return to editor.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-amber-500 text-white py-2 text-center text-xs font-bold uppercase sticky top-0 z-50">
        Preview Mode — Content is not saved to database
      </div>

      <article className="max-w-4xl mx-auto px-6 pt-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8">
          {data.title || "Untitled Story"}
        </h1>

        {data.thumbnail && (
          <img 
            src={data.thumbnail} 
            alt="Preview" 
            className="w-full h-auto rounded-2xl mb-10 shadow-lg"
          />
        )}

        <div 
          className="tiptap-content prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: data.content }} 
        />
      </article>

      <style jsx global>{`
        .tiptap-content h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 1.5rem; }
        .tiptap-content p { margin-bottom: 1.25rem; line-height: 1.8; color: #374151; }
        .tiptap-content blockquote { border-left: 4px solid #4f46e5; padding-left: 1.5rem; font-style: italic; }
      `}</style>
    </div>
  );
}