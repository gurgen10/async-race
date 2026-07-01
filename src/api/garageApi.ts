import { BASE_URL, fetchApi, fetchApiVoid } from './baseApi';
import type { Car, CarCreate } from '../types/car';

const PATH = '/garage';

export interface GarageListParams {
  page?: number;
  limit?: number;
}

export interface GarageListResponse {
  cars: Car[];
  total: number;
}

export const garageApi = {
  getCars: async (params: GarageListParams = {}): Promise<GarageListResponse> => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('_page', String(params.page));
    if (params.limit !== undefined) query.set('_limit', String(params.limit));

    const response = await fetch(`${BASE_URL}${PATH}?${query}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${PATH}`);

    const total = Number(response.headers.get('X-Total-Count') ?? 0);
    const cars = (await response.json()) as Car[];
    return { cars, total };
  },

  getCar: (id: number): Promise<Car> => fetchApi<Car>(`${PATH}/${id}`),

  createCar: (data: CarCreate): Promise<Car> =>
    fetchApi<Car>(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateCar: (id: number, data: CarCreate): Promise<Car> =>
    fetchApi<Car>(`${PATH}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deleteCar: (id: number): Promise<void> => fetchApiVoid(`${PATH}/${id}`, { method: 'DELETE' }),
};
