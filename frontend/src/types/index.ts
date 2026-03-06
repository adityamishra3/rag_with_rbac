export type Role = 'warehouse_staff' | 'compliance' | 'management';

export const ALL_ROLES: { value: Role; label: string; color: string }[] = [
  { value: 'warehouse_staff', label: 'Warehouse Staff', color: '#10b981' },
  { value: 'compliance',      label: 'Compliance',      color: '#818cf8' },
  { value: 'management',      label: 'Management',      color: '#f59e0b' },
];

export interface Source {
  title: string;
  content: string;
  relevance: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isError?: boolean;
}

export interface QueryRequest  { query: string; user_roles: string[]; }
export interface QueryResponse { answer: string; sources: Source[]; }
export interface IngestResponse { message: string; chunks_stored: number; }
