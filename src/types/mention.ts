/**
 * Mention & User Search Types
 * Types for @mention autocomplete and user search
 */

export interface MentionUser {
  uuid: string;
  handler: string;
  display_name: string | null;
  avatar_small?: string;
  is_creator: boolean;
}

export interface UserSearchResponse {
  message: string;
  users: MentionUser[];
}

export interface PublicUser {
  uuid: string;
  avatar: string;
  avatar_small: string;
  display_name: string;
  first_name: string;
  handler: string;
  is_creator: boolean;
}
