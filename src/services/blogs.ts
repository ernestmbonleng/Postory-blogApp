
import { Blog, CreateBlogDto } from '@/src/types/blogs';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMyBlog(token: string): Promise<Blog | null> {
  const res = await fetch(`${API_URL}/blogs/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch blog');
  }
  const data = await res.json().catch(() => null);
  return data?.blog ?? null;
}

export async function getPublicBlogBySlug(slug: string): Promise<Blog> {
  const res = await fetch(`${API_URL}/blogs/public/${slug}`, { 
    cache: 'no-store' 
    
  });  
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Blog profile not found');
  }
  return res.json();
}

export async function createBlog(data: CreateBlogDto, token: string): Promise<Blog> {
  const res = await fetch(`${API_URL}/blogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create blog');
  }
  return res.json();
}

export async function uploadBlogImage(
  file: File,
  token: string
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/blogs/images`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Upload failed:', text);
    throw new Error(`Image upload failed: ${text}`);
  }

  const data = await response.json(); // { success: true, data: { url } }
  return data.data;
}

export async function updateMyBlogImages(
  data: { coverImage?: string; profileImage?: string },
  token: string
) {
  const response = await fetch(`${API_URL}/blogs/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Update blog image failed:', text);
    throw new Error(`Update failed: ${text}`);
  }

  return response.json();
}

export async function getBlogByUserId(userId: string): Promise<Blog> {
  const res = await fetch(`${API_URL}/blogs/user/${userId}`);
  if (!res.ok) throw new Error('Blog not found');
  return res.json();
}