export type PriorityLevel = 'high' | 'medium' | 'low';
export type SortMode = 'default' | 'priority' | 'deadline';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority?: PriorityLevel;
  deadline?: number;  // ms timestamp (Date.getTime()); undefined = no deadline
}

export type FilterType = 'all' | 'active' | 'completed';
