import axios from 'axios';
import type { QueryRequest, QueryResponse, IngestResponse } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
});

export const queryDocuments = (req: QueryRequest) =>
  api.post<QueryResponse>('/query', req).then(r => r.data);

export const ingestFile = (file: File, title: string, roles: string[]) => {
  const form = new FormData();
  form.append('file', file);
  form.append('title', title);
  form.append('allowed_roles', roles.join(','));
  return api.post<IngestResponse>('/ingest', form).then(r => r.data);
};

export const checkHealth = () =>
  api.get('/health').then(() => true).catch(() => false);
