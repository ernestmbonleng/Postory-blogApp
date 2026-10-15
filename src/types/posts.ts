export interface Post {
  id: string; 
  _id?: string; 
  title: string;
  content: string;
  slug: string;
  status: 'draft' | 'published';
  thumbnail?: string;
  thumbnailPublicId?: string;
  excerpt?: string;
  categories?: string[];
  seoDescription?: string;
  readingTime?: number;
  likes: number;             
  likedBy: string[];   
  isLikedByMe?: boolean;
  likesCount: number;      
  commentsCount: number;     
  views: number;
  author?: {
    id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
    bio?: string;
  };
  blog?: {
    id: string;
    name: string;
    slug: string;
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  
}

export interface CreatePostDto {
  title: string;
  content: string;
  slug?: string;
  status: 'draft' | 'published';
  thumbnail?: string;
  categories?: string[];
  excerpt?: string;
  seoDescription?: string;
  thumbnailPublicId?: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface CreatePostResponse {
  success: boolean;
  message: string;
  data: Post; 
  seoDescription?: string;
  excerpt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  
}