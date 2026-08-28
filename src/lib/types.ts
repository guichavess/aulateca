export type CategoryId =
  | 'all'
  | 'producao-texto'
  | 'interpretacao-texto'
  | 'ludica'
  | 'sondagem'
  | 'datas-comemorativas';
export type AgeRange = 'all' | '6-8' | '9-11' | '12-14';
export type ResourceType = 'pdf';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
  count: number;
  path?: string;
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
  fileUrl?: string | null;
  imageUrl?: string;
}

