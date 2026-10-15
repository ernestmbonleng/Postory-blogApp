export interface Comment {
  _id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorRole: 'reader' | 'author'; 
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  isLikedByMe?: boolean;
  parentCommentId?: string | null;
}

export interface CreateCommentDto {
  content: string;
}