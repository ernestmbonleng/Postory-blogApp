import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle, Globe, Type, AlignLeft } from 'lucide-react';
import { updateMyBlog } from '@/src/services/blogs';

interface Props {
  open: boolean;
  onClose: () => void;
  blog: any;
  token: string;
}

export default function BlogSettingsDrawer({ open, onClose, blog, token }: Props) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    profileImage: '',
    coverImage: '',
  });

  useEffect(() => {
    if (open && blog) {
      setForm({
        title: blog.title || '',
        slug: blog.slug || '',
        description: blog.description || '',
        profileImage: blog.profileImage || '',
        coverImage: blog.coverImage || '',
      });
    }
  }, [open, blog]);

  const handleSave = async () => {

    if (!token || !blog) {
      console.error("Missing token or blog data");
      return;
    }
  
    setLoading(true);
  
    try {

      const payload = {
        ...form,
        slug: form.slug.trim() || (blog.slug ?? ''), 
      };
  
      await updateMyBlog(payload, token);
  
      await queryClient.invalidateQueries({ queryKey: ['my-blog'] });
      onClose();
    } catch (e: any) {
      console.error('Update failed:', e);
      alert(e.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">

      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />


      <div className="relative w-full max-w-[450px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Blog Settings</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configure your brand</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
        
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Type size={16} className="text-indigo-500" /> Blog Title
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. My Creative Journey"
              className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium text-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Globe size={16} className="text-indigo-500" /> URL Slug
            </label>
            <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-xl px-4 focus-within:border-indigo-500 transition-all">
              <span className="text-gray-400 text-sm">wordoo.com/</span>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="flex-1 bg-transparent border-none p-3 text-sm font-bold text-gray-700 focus:ring-0 outline-none"
              />
            </div>
            <p className="text-[10px] text-gray-400 font-medium italic">Careful: Changing this can break existing links.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <AlignLeft size={16} className="text-indigo-500" /> Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              placeholder="Tell your readers what your blog is about..."
              className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all text-sm leading-relaxed text-black"
            />
          </div>

        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.1em] shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}