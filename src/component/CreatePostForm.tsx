import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { CreatePostDto } from '@/src/types/posts';
import { usePosts } from '@/src/hooks/usePosts';
import { useAuth } from '@/src/hooks/useAuth'; // Added import
import { generateSlug } from '@/src/services/post';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import StatusModal from '@/src/component/statusModal'; // Added import
import {
  ArrowLeft, Globe, Settings, Image as ImageIcon,
  Tag, CheckCircle, Bold, Italic,
  List, ListOrdered, Heading1, Heading2, Quote,
  Type, Minus, RotateCcw, RotateCw, Code, AlertCircle, Eye
} from 'lucide-react';
import localforage from 'localforage';
import { debounce } from 'lodash';


interface CreatePostFormProps {
  token: string | null;
  onSuccess?: () => void;
  initialData?: any;
  isEditing?: boolean;
  isInline?: boolean;
}

const draftStorage = localforage.createInstance({
  name: 'WordooDrafts',
  storeName: 'post_drafts'
});


const CreatePostForm = forwardRef<any, CreatePostFormProps>(({
  token,
  onSuccess,
  initialData,
  isEditing = false,
  isInline = false,
}, ref) => {

  const queryClient = useQueryClient();
  const { createNewPost, updateExistingPost, loading, error: backendError } = usePosts();
  const { openAuthModal } = useAuth(); // Destructured openAuthModal
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const [isSuccessPending, setIsSuccessPending] = useState(false);

  const triggerModal = (type: 'success' | 'error', title: string, message: string) => {
    setModalType(type);
    setModalContent({ title, message });
    setShowStatusModal(true);
  };

  const [formData, setFormData] = useState<CreatePostDto>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    status: initialData?.status || 'draft',
    thumbnail: initialData?.thumbnail || '',
    thumbnailPublicId: initialData?.thumbnailPublicId || '',
    slug: initialData?.slug || '',
    categories: initialData?.categories || ['General'],
    excerpt: initialData?.excerpt || '',
    seoDescription: initialData?.seoDescription || '',
  });


  const saveDraft = useMemo(
    () =>
      debounce((content: string) => {
        if (!isEditing) {
          localStorage.setItem('wordoo_draft_content', content);
        }
      }, 1000),
    [isEditing]
  );

  useImperativeHandle(ref, () => ({
    submitDraft: () => handleSubmit('draft'),
    submitPublish: () => handleSubmit('published'),
  }));

  useEffect(() => {
    return () => {
      saveDraft.cancel();
    };
  }, [saveDraft]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({
        placeholder: 'Tell your story...',
      }),
    ],
    content: initialData?.content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'tiptap-content prose prose-lg max-w-none focus:outline-none min-h-[500px] px-8 py-8 text-gray-700',
      },
    },

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const plainText = editor.getText().trim();

      setFormData(prev => {
        const isUnderLimit = (prev.seoDescription?.length || 0) < 100;
        const isDeleting = plainText.length < (prev.seoDescription?.length || 0);
        const shouldSync = isUnderLimit || isDeleting;

        return {
          ...prev,
          content: html,
          excerpt: shouldSync ? plainText.substring(0, 100) : prev.excerpt,
          seoDescription: shouldSync ? plainText.substring(0, 100) : prev.seoDescription
        };
      });
      saveDraft(html);
    },
  });

  useEffect(() => {
    if (initialData && editor && isEditing) {
      setFormData({
        ...initialData,
        categories: initialData.categories || ['General']
      });
      editor.commands.setContent(initialData.content || '');
      if (initialData.updatedAt) setLastSaved(new Date(initialData.updatedAt));
    }
  }, [initialData, editor, isEditing]);


  useEffect(() => {
    if (!editor || isEditing) return;

    const loadDraftFromIndexedDB = async () => {
      try {
        const savedThumbnail = await draftStorage.getItem<string>('current_thumbnail');
        if (savedThumbnail) {
          setFormData(prev => ({
            ...prev,
            thumbnail: savedThumbnail
          }));
          setPreviewUrl(savedThumbnail);
        }
      } catch (error) {
        console.error('Failed to load thumbnail from IndexedDB:', error);
      }
    };

    loadDraftFromIndexedDB();
  }, [editor, isEditing]);


  useEffect(() => {
    if (!editor || isEditing) return;
    const savedTitle = localStorage.getItem('wordoo_draft_title');
    const savedContent = localStorage.getItem('wordoo_draft_content');
    const savedThumbnail = localStorage.getItem('wordoo_draft_thumbnail');

    if (savedTitle || savedContent || savedThumbnail) {
      setFormData(prev => ({
        ...prev,
        title: savedTitle || prev.title,
        content: savedContent || prev.content,
        thumbnail: savedThumbnail || prev.thumbnail
      }));
      if (savedContent) editor.commands.setContent(savedContent);
      setLastSaved(new Date());
    }
  }, [editor, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'title') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
      if (!isEditing) localStorage.setItem('wordoo_draft_title', value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        setFormData(prev => ({ ...prev, thumbnail: base64String }));
        if (!isEditing) {
          try {
            await draftStorage.setItem('current_thumbnail', base64String);
            await draftStorage.setItem('thumbnail_timestamp', Date.now());
          } catch (error) {
            console.error('Failed to save thumbnail to IndexedDB:', error);
          }
        }
      };
      reader.onerror = () => {
        triggerModal('error', 'File Error', 'Failed to read the selected file. Please try again.');
        console.error('FileReader error:', reader.error);
      };

      reader.readAsDataURL(selectedFile);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (publishStatus: 'draft' | 'published') => {
    if (!token) {
      openAuthModal();
      return;
    }

    const latestContent = editor?.getHTML() || "";
    if (!formData.title.trim()) {
      triggerModal('error', 'Missing Title', 'Please enter a title for your post before saving.');
      return;
    }

    setUploading(true);
    try {
      let finalThumbnail = formData.thumbnail;
      let finalPublicId = formData.thumbnailPublicId;

      if (file) {
        const fileFormData = new FormData();
        fileFormData.append('thumbnail', file);
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/thumbnail`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fileFormData,
        });

        if (!uploadRes.ok) {
          throw new Error(`Thumbnail upload failed`);
        }

        const uploadData = await uploadRes.json();
        finalThumbnail = uploadData.data.url;
        finalPublicId = uploadData.data.publicId;
      }

      const categoriesToSave = (formData.categories && formData.categories.length > 0)
        ? formData.categories
        : ["General"];

    const payload: CreatePostDto = {
      title: formData.title,
      content: latestContent,
      status: publishStatus,
      thumbnail: finalThumbnail,
      thumbnailPublicId: finalPublicId,
      slug: formData.slug,
      categories: categoriesToSave,
      excerpt: formData.excerpt,
      seoDescription: formData.seoDescription,
    };
    

      let result;
      if (isEditing && initialData?._id) {
        result = await updateExistingPost(initialData._id, payload, token);
      } else {
        result = await createNewPost(payload, token);
      }

      if (result) {
        localStorage.removeItem('wordoo_draft_title');
        localStorage.removeItem('wordoo_draft_content');
        localStorage.removeItem('wordoo_draft_thumbnail');
        await draftStorage.removeItem('current_thumbnail');

        queryClient.invalidateQueries({ queryKey: ['public-posts'] });
        queryClient.invalidateQueries({ queryKey: ['user-posts'] });

        if (!isInline) {

          const isDraft = publishStatus === 'draft';

          triggerModal(
            'success',
            isDraft ? "Draft Saved" : (isEditing ? "Post Updated" : "Post Published"),
            isDraft
              ? "Your progress has been saved securely."
              : "Your story is now live for everyone to read!"
          );
          setIsSuccessPending(true);
        } else {
          if (onSuccess) onSuccess();
        }

      }

      if (!isEditing && publishStatus === 'published') {
        setFormData({
          title: '', content: '', status: 'draft', thumbnail: '',
          thumbnailPublicId: '', slug: '', categories: ['General'],
          excerpt: '', seoDescription: ''
        });
        editor?.commands.setContent('');
      }

    } catch (err: any) {
      triggerModal('error', 'Request Failed', err.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`${isInline ? 'min-h-[600px]' : 'min-h-screen'} bg-gray-50 flex flex-col font-sans`}>
      <style>{`
        .tiptap-content h1 { font-size: 2.25rem !important; font-weight: 800 !important; margin-bottom: 1.5rem !important; color: #111827 !important; display: block !important; }
        .tiptap-content h2 { font-size: 1.5rem !important; font-weight: 700 !important; margin-top: 2rem !important; margin-bottom: 1rem !important; color: #1f2937 !important; display: block !important; }
        .tiptap-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 1rem 0 !important; }
        .tiptap-content ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 1rem 0 !important; }
        .tiptap-content blockquote { border-left: 4px solid #4f46e5 !important; background: #f5f7ff !important; padding: 1rem 1.5rem !important; font-style: italic !important; margin: 1.5rem 0 !important; color: #4338ca !important; }
        .tiptap-content p { margin-bottom: 1rem !important; line-height: 1.75 !important; }
        .tiptap-content code { background: #f3f4f6 !important; padding: 0.2rem 0.4rem !important; border-radius: 0.25rem !important; font-family: monospace !important; }
      `}</style>

      {!isInline && (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-none">{formData.title || (isEditing ? 'Editing Post' : 'New Draft')}</h1>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                {lastSaved ? `${isEditing ? 'Last updated' : 'Saved'} ${lastSaved.toLocaleTimeString()}` : 'Unsaved changes'}
                {(loading || uploading) && <span className="animate-pulse text-indigo-500 ml-1 font-medium italic">Saving...</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => handleSubmit('draft')} className="hidden sm:flex text-sm font-semibold text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
              {isEditing ? 'Keep as Draft' : 'Save Draft'}
            </button>
            <button type="button" onClick={() => handleSubmit('published')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95">
              {isEditing || formData.status === 'published' ? 'Update' : 'Publish'} <Globe size={16} />
            </button>
          </div>
        </header>
      )}

      <div className={`flex-1 max-w-[1600px] mx-auto w-full ${isInline ? 'p-2' : 'p-4 sm:p-6 lg:p-8'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[calc(100vh-200px)]">
              <div className="relative group bg-gray-50 border-b border-gray-100 min-h-[60px]">
                {formData.thumbnail ? (
                  <div className="relative aspect-[21/9] w-full overflow-hidden">
                    <img src={formData.thumbnail} className="w-full h-full object-cover" alt="Cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">
                        Change Cover
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex justify-center w-full">
                    <label className="w-full max-w-2xl py-12 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-indigo-100 bg-indigo-50/30 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer group/cover">
                      <div className="p-3 bg-white rounded-full shadow-sm group-hover/cover:scale-110 transition-transform">
                        <ImageIcon size={28} className="text-indigo-600 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-indigo-900">Add a beautiful cover image</p>
                        <p className="text-xs text-indigo-400 mt-1 font-medium">Click to browse your files</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                )}
              </div>

              <div className="px-8 pt-8 pb-2">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Post Title"
                  className="w-full text-4xl md:text-5xl font-extrabold text-gray-900 placeholder-gray-200 border-none p-0 focus:ring-0 bg-transparent leading-tight tracking-tight outline-none"
                />
              </div>

              <div className="flex items-center gap-1 border-y border-gray-100 px-6 py-2 bg-white sticky top-0 z-20 flex-wrap">
                <ToolbarButton onClick={() => editor?.chain().focus().undo().run()} icon={<RotateCcw size={16} />} />
                <ToolbarButton onClick={() => editor?.chain().focus().redo().run()} icon={<RotateCw size={16} />} />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })} icon={<Heading1 size={18} />} />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} icon={<Heading2 size={18} />} />
                <ToolbarButton onClick={() => editor?.chain().focus().setParagraph().run()} active={editor?.isActive('paragraph')} icon={<Type size={18} />} />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} icon={<Bold size={18} />} />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} icon={<Italic size={18} />} />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} icon={<Code size={18} />} />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} icon={<List size={18} />} />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} icon={<ListOrdered size={18} />} />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} icon={<Quote size={18} />} />
                <ToolbarButton onClick={() => editor?.chain().focus().setHorizontalRule().run()} icon={<Minus size={18} />} />
              </div>

              <EditorContent editor={editor} className="flex-1 cursor-text" />
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
                <Settings size={18} /> Post Settings
              </h3>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Tag size={14} /> Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {['General', 'Coding', 'Technology', 'Lifestyle', 'Food', 'Travel', 'Sports'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, categories: [cat] }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.categories?.includes(cat)
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Globe size={14} /> URL Slug
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <span className="text-gray-400 text-xs mr-1">/blog/</span>
                  <input
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="bg-transparent border-none p-0 text-sm text-gray-600 focus:ring-0 w-full font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CheckCircle size={14} /> SEO Snippet
                </label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-lg border-gray-200 text-sm p-3 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Meta description for search results..."
                />
                <p className={`text-[10px] font-bold text-right ${(formData.seoDescription?.length || 0) < 20 ? 'text-red-400' : 'text-green-500'
                  }`}>
                  {formData.seoDescription?.length || 0} / Min 20 chars
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-5 text-center">
              <button
                type="button"
                onClick={() => {
                  const previewData = {
                    ...formData,
                    content: editor?.getHTML() || "",
                    thumbnail: previewUrl || formData.thumbnail
                  };

                  sessionStorage.setItem('wordoo_preview_data', JSON.stringify(previewData));

                  window.open('/preview', '_blank');
                }}
                className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-indigo-200 border py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Eye size={18} /> Preview Post
              </button>
            </div>

            {backendError && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs font-bold text-red-600 uppercase flex items-center gap-2">
                <AlertCircle size={14} /> Sync Error: {backendError}
              </div>
            )}
          </aside>
        </div>
      </div>

      <StatusModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          if (isSuccessPending && onSuccess) {
            onSuccess();
            setIsSuccessPending(false);
          }
        }}
        type={modalType}
        title={modalContent.title}
        message={modalContent.message}
      />
    </div>
  );
});

const ToolbarButton = ({ onClick, active, icon }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-md transition-all ${active ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
      }`}
  >
    {icon}
  </button>
);

export default CreatePostForm;