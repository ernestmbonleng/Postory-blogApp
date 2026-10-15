import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  CreatePostDto,
  Post,
  ApiResponse,
  CreatePostResponse,
  ErrorResponse
} from '@/src/types/posts';


const API_URL = process.env.NEXT_PUBLIC_API_URL ;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});


api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('access_token')
        : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post<{ accessToken: string }>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data.accessToken) {
          sessionStorage.setItem(
            'access_token',
            refreshResponse.data.accessToken
          );

          originalRequest.headers.Authorization =
            `Bearer ${refreshResponse.data.accessToken}`;

          return api(originalRequest);
        }
      } catch {
        sessionStorage.removeItem('access_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getPublicPopular = async () => {
  const res = await fetch(`${BASE_URL}/public/popular`); 
  if (!res.ok) throw new Error('Failed to load popular posts');
  return res.json();
};

export const getPublicFeatured = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/featured`);
    console.log('Fetching from:', process.env.NEXT_PUBLIC_API_URL);

    if (!res.ok) throw new Error('Failed to fetch editor picks');
    return res.json();
  } catch (error) {
    console.error("Featured Fetch Error:", error);
    return { data: [] }; 
  }
};


export async function getPublicPostDetail(slug: string): Promise<ApiResponse<Post>> {
  try {
   
    const response = await api.get<ApiResponse<Post>>(`/public/post/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Public Fetch Error:", error);
    throw error;
  }
}


export async function getTenantPublicPosts(
  options?: { page?: number; limit?: number; category?: string; } 
): Promise<ApiResponse<{ posts: Post[] }>> { 
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    
    if (options?.category) params.append('category', options.category);

    
    const response = await api.get<ApiResponse<{ posts: Post[] }>>(
      `/public${params.toString() ? `?${params.toString()}` : ''}`
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw {
      success: false,
      message: axiosError.response?.data?.message || 'Failed to fetch public posts',
      error: axiosError.message,
      statusCode: axiosError.response?.status || 500,
    };
  }
}


export async function createPost(
  postData: CreatePostDto,
  token?: string
): Promise<CreatePostResponse> {
  try {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    const response = await api.post<CreatePostResponse>(
      '/posts',
      postData,
      config
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse & { details?: any }>;

    if (axiosError.response?.status === 422) {
      throw {
        message: 'Validation failed',
        statusCode: 422,
        details: axiosError.response.data.details,
      };
    }

    throw {
      message:
        axiosError.response?.data?.message || 'Failed to create post',
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function updatePost(
  postId: string,
  updateData: Partial<CreatePostDto>,
  token: string
): Promise<ApiResponse<Post>> {
  try {
    const response = await api.patch<ApiResponse<Post>>(
      `/posts/${postId}`,
      updateData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to update post'
    );
    
  }
}


export async function deletePost(
  postId: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/posts/${postId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw {
      success: false,
      message:
        axiosError.response?.data?.message || 'Failed to delete post',
      error: axiosError.message,
    };
  }
}

export async function getUserPosts(
  token: string
): Promise<ApiResponse<Post[]>> {
  try {
    const response = await api.get<ApiResponse<Post[]>>('posts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const postsWithViews = (response.data.data || []).map(post => ({
      ...post,
      views: post.views || 0
    }));

    return {
      ...response.data,
      data: postsWithViews
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to fetch posts'
    );
  }
}


export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}



export async function uploadPostThumbnail(
  file: File,
  token: string
): Promise<{ url: string; publicId: string }> {
  try {
    const formData = new FormData();
    formData.append('thumbnail', file); 

    const response = await api.post<{
      success: boolean;
      data: { url: string; publicId: string };
      message: string;
    }>(
      '/posts/thumbnail',
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw {
      message:
        axiosError.response?.data?.message ||
        'Failed to upload thumbnail',
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export { api };

export const getPostById = async (id: string, token?: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {

    const authToken = token || (typeof window !== 'undefined' 
      ? sessionStorage.getItem('access_token')
      : null);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${apiUrl}/posts/${id}`, {
      method: 'GET',
      headers,
      credentials: 'include', 
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch post';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }


      switch (response.status) {
        case 401:
          errorMessage = 'Authentication required. Please log in.';
          break;
        case 403:
          errorMessage = 'You do not have permission to view this post.';
          break;
        case 404:
          errorMessage = 'Post not found. It may have been deleted.';
          break;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch post');
    }
    
    return result.data; 
  } catch (error) {
    console.error("Error in getPostById:", error);
    throw error;
  }
}

export async function getPostViews(postId: string, token?: string): Promise<number> {
  try {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    const response = await api.get<ApiResponse<Post>>(
      `/posts/${postId}`,
      config
    );
    
    return response.data.data?.views || 0;
  } catch (error) {
    console.error('Error fetching post views:', error);
    return 0;
  }
}
export async function getPostsWithViews(token?: string): Promise<Post[]> {
  try {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    const response = await api.get<ApiResponse<Post[]>>(
      '/posts',
      config
    );

    return (response.data.data || []).map(post => ({
      ...post,
      views: post.views || 0
    }));
  } catch (error) {
    console.error('Error fetching posts with views:', error);
    return [];
  }
}


export async function toggleLike(postId: string): Promise<{ liked: boolean; likes: number }> {
  try {
    const { getToken } = await import('./auth-storage');
    const token = getToken();
    
    const response = await axios.post(
      `${API_URL}/posts/${postId}/like`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      }
    );
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error("Like API Error:", axiosError.response?.data || axiosError.message);
    throw {
      success: false,
      message: axiosError.response?.data?.message || 'Failed to toggle like',
      statusCode: axiosError.response?.status || 500,
    };
  }
}