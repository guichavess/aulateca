export type CategoryId = 'all' | 'narrative' | 'descriptive' | 'opinion' | 'poetry' | 'informative' | 'games';
export type AgeRange = 'all' | '6-8' | '9-11' | '12-14';
export type ResourceType = 'video' | 'pdf';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
  count: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  type: ResourceType;
  ageRange: AgeRange;
  duration: string;
  downloads: number;
  rating: number;
  isNew?: boolean;
  author: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  liked?: boolean;
}

export interface AIPlanMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PlanHistory {
  id: string;
  title: string;
  date: string;
}
