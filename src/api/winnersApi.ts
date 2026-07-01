import { BASE_URL, fetchApi, fetchApiVoid } from './baseApi';
import type { Winner, WinnerCreate } from '../types/winner';

const PATH = '/winners';

export type WinnerSortField = 'id' | 'wins' | 'time';
export type SortOrder = 'ASC' | 'DESC';

export interface WinnersListParams {
  page?: number;
  limit?: number;
  sort?: WinnerSortField;
  order?: SortOrder;
}

export interface WinnersListResponse {
  winners: Winner[];
  total: number;
}

export const winnersApi = {
  getWinners: async (params: WinnersListParams = {}): Promise<WinnersListResponse> => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('_page', String(params.page));
    if (params.limit !== undefined) query.set('_limit', String(params.limit));
    if (params.sort) query.set('_sort', params.sort);
    if (params.order) query.set('_order', params.order);

    const response = await fetch(`${BASE_URL}${PATH}?${query}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${PATH}`);

    const total = Number(response.headers.get('X-Total-Count') ?? 0);
    const winners = (await response.json()) as Winner[];
    return { winners, total };
  },

  getWinner: (id: number): Promise<Winner> => fetchApi<Winner>(`${PATH}/${id}`),

  createWinner: (data: WinnerCreate): Promise<Winner> =>
    fetchApi<Winner>(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateWinner: (id: number, data: Partial<Omit<WinnerCreate, 'id'>>): Promise<Winner> =>
    fetchApi<Winner>(`${PATH}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deleteWinner: (id: number): Promise<void> => fetchApiVoid(`${PATH}/${id}`, { method: 'DELETE' }),
};
