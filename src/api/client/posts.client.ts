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

export interface CreatePostParams {
  caption: string;
  images?: File[];
  audioFiles?: File[];
  location?: string;
  latitude?: number;
  longitude?: number;
}

export const postsClient = {
  list: async (params?: { page?: number }): Promise<PostListResponse> => {
    const data = await apiClient.get<{ posts?: PostListResponse }>(
      '/posts',
      params ? { params } : undefined
    );
    return data.posts || (data as PostListResponse);
  },

  get: async (id: number, serverToken?: string): Promise<Post> => {
    const data = await apiClient.get<{ post?: Post; data?: Post }>(
      `/posts/${id}`,
      serverToken ? { serverToken } : undefined
    );
    return data.post || data.data || (data as Post);
  },

  create: async (params: CreatePostParams): Promise<Post> => {
    const formData = new FormData();
    formData.append('caption', params.caption);
    if (params.images) {
      for (const img of params.images) {
        formData.append('post_image[]', img);
      }
    }
    if (params.audioFiles) {
      for (const audio of params.audioFiles) {
        formData.append('post_audio[]', audio);
      }
    }
    if (params.location) formData.append('location', params.location);
    if (params.latitude != null) formData.append('latitude', String(params.latitude));
    if (params.longitude != null) formData.append('longitude', String(params.longitude));

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

  getComments: async (
    id: number,
    params?: { page?: number },
    serverToken?: string
  ): Promise<PostCommentListResponse> => {
    const config: Record<string, unknown> = {};
    if (params) config.params = params;
    if (serverToken) config.serverToken = serverToken;
    const data = await apiClient.get<{
      postComment?: PostCommentListResponse;
      comments?: PostCommentListResponse;
    }>(`/post-comments/posts/${id}`, Object.keys(config).length ? config : undefined);
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

  likeComment: async (commentId: number): Promise<void> => {
    await apiClient.post(`/post-comments/${commentId}/like-toggle`);
  },

  dislikeComment: async (commentId: number): Promise<void> => {
    await apiClient.post(`/post-comments/${commentId}/dislike`);
  },

  getCommentReplies: async (commentId: number): Promise<PostCommentListResponse> => {
    const data = await apiClient.get<{
      postComment?: PostCommentListResponse;
      comments?: PostCommentListResponse;
      data?: PostCommentListResponse;
    }>(`/post-comments/${commentId}/replies`);
    return (
      data.postComment || data.comments || data.data || (data as unknown as PostCommentListResponse)
    );
  },

  postComment: async (postId: number, content: string, parentId?: number): Promise<PostComment> => {
    return postsClient.addComment(postId, content, parentId);
  },

  deleteComment: async (commentUuid: string): Promise<void> => {
    await apiClient.delete(`/post-comments/${commentUuid}/delete`);
  },
};
