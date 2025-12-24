/**
 * Community Posts API Client
 *
 * API Endpoints:
 * - GET /posts → PostListResponse
 * - GET /posts/{id} → Post
 * - POST /posts → Post
 * - POST /posts/{id}/like → { likes_count, dislikes_count }
 * - POST /posts/{id}/dislike → { likes_count, dislikes_count }
 * - DELETE /posts/{id} → void
 * - GET /post-comments/posts/{id} → PostCommentListResponse
 * - POST /post-comments/posts/{id} → PostComment
 */

import type { Post, PostComment, PostCommentListResponse, PostListResponse } from '../types';
import { apiClient } from './base-client';

export const postsClient = {
  list: async (params?: { page?: number }): Promise<PostListResponse> => {
    const data = await apiClient.get<{ posts?: PostListResponse }>(
      '/posts',
      params ? { params } : undefined
    );
    return data.posts || (data as PostListResponse);
  },

  get: async (id: number): Promise<Post> => {
    const data = await apiClient.get<{ post?: Post; data?: Post }>(`/posts/${id}`);
    return data.post || data.data || (data as Post);
  },

  create: async (caption: string, image?: File): Promise<Post> => {
    const formData = new FormData();
    formData.append('caption', caption);
    if (image) {
      formData.append('post_image', image);
    }
    const data = await apiClient.post<{ post?: Post; data?: Post }>('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.post || data.data || (data as Post);
  },

  like: async (id: number): Promise<{ likes_count: number; dislikes_count: number }> => {
    return apiClient.post<{ likes_count: number; dislikes_count: number }>(`/posts/${id}/like`);
  },

  dislike: async (id: number): Promise<{ likes_count: number; dislikes_count: number }> => {
    return apiClient.post<{ likes_count: number; dislikes_count: number }>(`/posts/${id}/dislike`);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },

  getComments: async (id: number, params?: { page?: number }): Promise<PostCommentListResponse> => {
    const data = await apiClient.get<{
      postComment?: PostCommentListResponse;
      comments?: PostCommentListResponse;
    }>(`/post-comments/posts/${id}`, params ? { params } : undefined);
    return data.postComment || data.comments || (data as PostCommentListResponse);
  },

  addComment: async (postId: number, content: string, parentId?: number): Promise<PostComment> => {
    const data = await apiClient.post<{ postComment?: PostComment; data?: PostComment }>(
      `/post-comments/posts/${postId}`,
      {
        content,
        ...(parentId && { parent_id: parentId }),
      }
    );
    return data.postComment || data.data || (data as PostComment);
  },
};
