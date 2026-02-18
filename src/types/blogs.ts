export interface CreateBlogDto {
  title: string;
  description: string;
}
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  coverImage?: string;
  profileImage?: string;
  status?: string;
  categories: string[];
  tenantId: string;
  authorId: string;
  authorName: string;
  subscriberCount: number;
  isSubscribed?: boolean;
  notificationPreferences: {
    newPosts: boolean;
    comments: boolean;
    likes: boolean;
  };
  createdAt: string;
}
