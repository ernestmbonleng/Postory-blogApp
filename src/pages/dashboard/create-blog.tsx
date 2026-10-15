import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { createBlog, getMyBlog } from '@/src/services/blogs';
import { getToken } from '@/src/services/auth-storage';
import { CreateBlogDto } from '@/src/types/blogs';
import { Button } from '@/src/component/ui/button';

export default function CreateBlogPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.push('/login');
    } else {
      setToken(t);
    }
  }, [router]);

  const { data: existingBlog, isLoading } = useQuery({
    queryKey: ['my-blog'],
    queryFn: () => getMyBlog(token as string),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (existingBlog && !router.asPath.includes('success')) {
      router.push('/dashboard');
    }
  }, [existingBlog, router]);

  const [form, setForm] = useState<CreateBlogDto>({
    title: '',
    description: '',
  });

  const mutation = useMutation({
    mutationFn: (data: CreateBlogDto) => createBlog(data, token as string),
    onSuccess: (response: any) => {
      const newBlog = response?.data || response;
      const slug = newBlog?.slug;

      queryClient.invalidateQueries({ queryKey: ['my-blog'] });

      if (slug) {
        router.push(`/blogs/${slug}`);
      } else {
        router.push('/dashboard');
      }
    },
    onError: (err: any) => {
      console.error("Blog creation failed:", err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (!token || isLoading || (existingBlog && !mutation.isSuccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium tracking-tight">Checking Wordoo profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans relative overflow-hidden py-12 px-4">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="w-full max-w-[550px] bg-white rounded-2xl shadow-sm border border-gray-100 p-10 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <span className="text-[26px] font-black tracking-tight text-gray-900 flex items-center group">
            
            <span className="relative flex items-center text-indigo-600 ml-0.5">
              o
              <span className="-ml-1.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                o
              </span>

          
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5
                     bg-indigo-500 rounded-full
                     opacity-0 group-hover:opacity-100
                     transition-all duration-300 ease-out">
              </span>
            </span>
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your blog</h1>
          <p className="text-gray-500 text-sm text-center">
            Set up your public profile to start sharing your stories.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mutation.isError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
              {(mutation.error as any)?.message || 'Failed to create blog. Please try again.'}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-900">Blog Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. The Tech Journal"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-900">About the Blog</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What will you be writing about?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-gray-900 placeholder:text-gray-400 resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors font-semibold shadow-md"
            isLoading={mutation.isPending}
          >
            {mutation.isPending ? 'Launching Blog...' : 'Launch My Blog'}
          </Button>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Cancel and go back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}