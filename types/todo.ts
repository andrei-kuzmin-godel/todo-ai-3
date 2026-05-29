export type PriorityLevel = 'high' | 'medium' | 'low';
export type SortMode = 'default' | 'priority' | 'deadline';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority?: PriorityLevel;
}

export type FilterType = 'all' | 'active' | 'completed';
